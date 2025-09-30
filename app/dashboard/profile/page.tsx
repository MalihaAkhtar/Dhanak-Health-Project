"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  setUser?: (user: User) => void;
};

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  profileImage?: string;
};

export default function ProfilePage() {
  const { user, setUser } = useAuth() as AuthContextType;
  const { toast } = useToast();
  const BACKEND_URL = "http://localhost:5000";

  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    profileImage: "",
  });
  const [profileImage, setProfileImage] = useState<string>("/placeholder-user.jpg");
  const [loading, setLoading] = useState(true);

  // Normalize image
  const getImageSrc = (image?: string) => {
    if (!image) return "/placeholder-user.jpg";
    return image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/${user._id}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data: ProfileData = await res.json();

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          specialization: data.specialization || "",
          profileImage: data.profileImage || "",
        });

        setProfileImage(data.profileImage || "/placeholder-user.jpg");
      } catch (err: any) {
        console.error("Fetch profile error:", err);
        toast({ title: "Error", description: "Could not load profile data." });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?._id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return toast({ title: "Error", description: "No user ID found." });

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, profileImage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
      setUser?.(data);
    } catch (err: any) {
      console.error("Update profile error:", err);
      toast({ title: "Error", description: err.message || "Could not update profile." });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      setProfileImage(base64Image);
      setFormData((prev) => ({ ...prev, profileImage: base64Image }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile image</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={getImageSrc(profileImage)} alt={formData.name} />
                <AvatarFallback>{(formData.name || "U").charAt(0)}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-sm text-gray-500 text-center">Click the camera icon to upload a new profile picture</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" value={formData.specialization || ""} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} required />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
              </div>

              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
