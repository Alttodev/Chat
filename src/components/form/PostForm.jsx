import { Controller, useForm } from "react-hook-form";
import { toastError, toastSuccess } from "@/lib/toast";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "../ui/textarea";
import { usePostCreate } from "@/hooks/postHooks";

export function PostForm({ userProfile }) {
  const { mutateAsync: createPost } = usePostCreate();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      postText: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await createPost(data);
      toastSuccess(res?.message || "Post created successfully");
      reset();
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 text-emerald-600">
          <AvatarFallback>
            {userProfile?.profile?.userName?.charAt(0).toUpperCase() || "-"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Controller
            name="postText"
            control={control}
            rules={{ required: "Post text is required" }}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={`What's on your mind, ${userProfile?.profile?.userName}?`}
                className="min-h-[90px] resize-none border-0 bg-muted focus:bg-background text-sm sm:text-base"
              />
            )}
          />
          {errors.postText?.message && (
            <p className="text-red-500 text-sm">{errors.postText?.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-20 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg shadow-sm transition cursor-pointer text-base"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
}
