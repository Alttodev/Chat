import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Phone, MapPin } from "lucide-react";
import TextInput from "../form_inputs/TextInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastError, toastSuccess } from "@/lib/toast";
import { loginSchema } from "@/lib/validation";

export function PersonalInfoForm({ profileData, setProfileData, isEditing }) {
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      console.log(data);
      toastSuccess("Login successful");
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Manage your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1  gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <TextInput
                name="name"
                control={control}
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                disabled={!isEditing}
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <TextInput
                name="email"
                type="email"
                control={control}
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={!isEditing}
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <TextInput
                name="address"
                control={control}
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                disabled={!isEditing}
                className="bg-card"
              />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
