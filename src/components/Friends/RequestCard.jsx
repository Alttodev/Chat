import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFollowRequestUpdate, useRequestList } from "@/hooks/postHooks";
import { formatRelative } from "@/lib/dateHelpers";
import { Check, X } from "lucide-react";
import { Fragment, useMemo } from "react";
import { SkeletonRequest } from "../skeleton/RequestSkeleton";
import { toastError, toastSuccess } from "@/lib/toast";
import { Link } from "react-router-dom";

export const RequestCard = () => {
  const { mutateAsync: requestRespond } = useFollowRequestUpdate();
  const { data: request, isFetching } = useRequestList();
  const requestData = useMemo(() => request, [request]);
  const requestedData = requestData?.requests?.filter(
    (item) => item?.isDeleted !== true
  );

  const handleAccept = async ({ id, action }) => {
    try {
      const formData = { action };
      const res = await requestRespond({ id, formData });
      toastSuccess(res?.message);
    } catch (err) {
      toastError(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (!requestedData || requestedData.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No requests found</div>
    );
  }
  if (isFetching) {
    return <SkeletonRequest />;
  }
  return (
    <Fragment>
      {requestedData &&
        requestedData?.map((item) => (
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                to={`/users/${item?.from?._id}`}className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-xl font-semibold  text-emerald-700">
                    {item?.from?.userName?.charAt(0).toUpperCase() || "-"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{item?.from?.userName}</h3>
                  <p className="text-sm text-gray-500">{item?.from?.address}</p>
                  <span className="text-xs text-gray-400">
                    Requested {formatRelative(item?.createdAt)}
                  </span>
                </div>
              </Link>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleAccept({ id: item._id, action: "accept" })
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    handleAccept({ id: item._id, action: "decline" })
                  }
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </Fragment>
  );
};
