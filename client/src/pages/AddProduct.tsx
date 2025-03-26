import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import { ArrowLeft } from "lucide-react";

// Use the schema directly without extending
type ProductFormValues = z.infer<typeof insertProductSchema>;

const AddProduct = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<{ url: string; isMain: boolean }[]>([]);

  // Redirect if not logged in or not a seller
  if (!user) {
    navigate("/");
    return null;
  }

  if (!user.isSeller) {
    toast({
      title: "Not authorized",
      description: "You need a seller account to list products.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  // Initialize the form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      location: "",
      sellerId: String(user.id),
      status: "active" as const,
    },
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      console.log("Submitting values:", values); // Debug log
      
      // Create the product using the dedicated function
      const res = await fetch('/.netlify/functions/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          sellerId: String(user.id),
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText); // Debug log
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug log
      
      // Upload images for the product
      if (uploadedImages.length > 0) {
        await Promise.all(
          uploadedImages.map(async (image) => {
            const imageRes = await fetch(`/.netlify/functions/create-product-image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                url: image.url,
                isMain: image.isMain,
                productId: data.product.id,
              })
            });
            
            if (!imageRes.ok) {
              const imageError = await imageRes.text();
              console.error("Image Upload Error:", imageError); // Debug log
              throw new Error(imageError);
            }
          })
        );
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product added",
        description: "Your item has been listed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/seller"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Mutation Error:", error); // Debug log
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: ProductFormValues) => {
    console.log("Form values:", values); // Debug log
    
    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one image for your product.",
        variant: "destructive",
      });
      return;
    }
    
    createProduct.mutate(values);
  };

  // Handle image upload
  const handleImageUploaded = (url: string, isMain: boolean) => {
    setUploadedImages((prev) => {
      // If this is a main image, set all others to not main
      if (isMain) {
        return [...prev.map(img => ({ ...img, isMain: false })), { url, isMain }];
      }
      return [...prev, { url, isMain }];
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Add New Listing</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Provide the details of the item you're listing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Vintage Camera, Refurbished Headphones, etc." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Home Goods">Home Goods</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Vintage">Vintage</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-neutral-500 sm:text-sm">₹</span>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0.00"
                          className="pl-7 pr-12"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="For Parts">For Parts</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item, its features, history, etc."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Add up to 6 photos of your item. The first image will be the cover photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3">
                <ImageUpload
                  productId={`temp-${user.id}-${Date.now()}`}
                  onImageUploaded={(url, isMain) => handleImageUploaded(url, true)}
                  isMainUpload={true}
                />
                
                {[...Array(5)].map((_, index) => (
                  <ImageUpload
                    key={index}
                    productId={`temp-${user.id}-${Date.now()}-${index}`}
                    onImageUploaded={(url) => handleImageUploaded(url, false)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City, State</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Portland, OR" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Let buyers know where your item is located.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddProduct;
