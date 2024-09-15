"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-separator";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";

const specialChar: string = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessage: string =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const page = () => {
  const params = useParams<{ username: string }>();
  const { username } = params;

  const [isUserAcceptingMessages, setIsUserAcceptingMessages] = useState<
    boolean | undefined
  >(undefined);
  const {toast} = useToast();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState<boolean>(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string>(initialMessage);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      form.reset({ ...form.getValues(), content: "" });
      if(response.data.success) {
        toast({
          title: "Message sent successfully"
        });  
      }
      
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = useCallback(async () => {
    if (isUserAcceptingMessages === undefined) return;
    setIsSuggestLoading(true);
    try {
      const response = await axios.post("/api/suggest-messages");
      console.log(response.data);
      setSuggestedMessages(response.data.response.candidates[0].content.parts[0].text ?? initialMessage);
      setIsSuggestLoading(false);
    } catch (error) {
      setIsSuggestLoading(false);
    }
  }, [isUserAcceptingMessages, isSuggestLoading]);

  const checkUserAcceptingMessages = async () => {
    try {
      const response = await axios.post("/api/get-user-accepting-messages", {
        username: params.username,
      });
      setIsUserAcceptingMessages(response.data.success ?? false);  
      fetchSuggestedMessages();
    } catch (error) {}
  };

  useEffect(() => {
    checkUserAcceptingMessages();
  }, [isUserAcceptingMessages, toast]);

  if (isUserAcceptingMessages === undefined) {
    return (
      <div className="flex text-center text-gray-600 w-full h-full justify-center">
        <Loader2 className="mr-2 text-9xl animate-spin" />
      </div>
    );
  }

  if (!isUserAcceptingMessages) {
    return (
      <div className="flex text-3xl justify-center text-red-600">
        User is not accepting messages
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {parseStringMessages(suggestedMessages).map((message, index) => (
              <span
                key={index}
                className="my-1 text-wrap text-center p-1 border border-black hover:cursor-pointer hover:bg-slate-500 hover:text-white rounded-lg shadow-lg"
                onClick={() => handleMessageClick(message)}
              >
                {message}
              </span>
            ))}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href="/sign-up">
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default page;
