"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { Message } from "@/model/User";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const page = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwithcLoading, setIsSwithcLoading] = useState<boolean>(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(
      messages.filter((message: Message) => message._id !== messageId)
    );
  };

  const { data: session } = useSession();

  if (!session || !session.user) {
    return <div>Please login</div>;
  }

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwithcLoading(true);

    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");

      setValue("acceptMessages", response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Error while fetching message status",
        variant: "destructive",
      });
    } finally {
      setIsSwithcLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwithcLoading(false);

      try {
        const response: AxiosResponse = await axios.get<ApiResponse>(
          "/api/get-messages"
        );
        console.log(response.data);
        setMessages(response.data.messageList ?? []);

        if (refresh) {
          toast({
            title: "Refreshed messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        toast({
          title: "Error",
          description:
            axiosError.response?.data.message ||
            "Error while fetching message status",
          variant: "destructive",
        });
      } finally {
        setIsSwithcLoading(false);
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAcceptMessage();
    }

  }, [session, setValue, fetchAcceptMessage]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });

      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Error while fetching message status",
        variant: "destructive",
      });
    }
  };

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied to clipboard",
      description: "Profile URL copied to clipboard",
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy your unique link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
        <div className="mb-4">
          <Switch
            {...register("acceptMessages")}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwithcLoading}
          ></Switch>
          <span className="ml-2">
            Accept Messages: {acceptMessages ? "On" : "Off"}
          </span>
        </div>
        <Separator />

        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message: Message, index: number) => {
              return (
                <MessageCard 
                  key={message._id as string}
                  message={message}
                  onMessageDelete={handleDeleteMessage}
                />
              )
            })
          ) : <p>No message to display</p>}
        </div>
      </div>
    </div>
  );
};

export default page;
