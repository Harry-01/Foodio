"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { SubscribeToDishPayload } from "@/lib/validators/dish";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

interface SubscribeLeaveToggleProps {
  dishId: string;
  dishName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  dishId,
  dishName,
  isSubscribed
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToDishPayload = {
        dishId,
      };
      const { data } = await axios.post("/api/dish/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Subscribed",
        description: `You are now subscribed to ${dishName}`,
      });
    },
  });
  return isSubscribed ? (
    <Button className="w-full mt-1 mb-4">Leave Community</Button>
  ) : (
    <Button
      isLoading={isSubLoading}
      onClick={() => subscribe()}
      className="w-full mt-1 mb-4"
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
