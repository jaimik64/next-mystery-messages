import UserModel, { Message } from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  await dbConnect();

  const { username, content } = await req.json();

  try {
    const user = await UserModel.findOne({ username: username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // check if the user is accepting the messages

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User not accepting messages",
        },
        { status: 403 }
      );
    }

    const newMessage: Message = {
      content: content,
      createdAt: new Date(),
    } as Message;

    user.messageList.push(newMessage);

    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while sending message: " + error);

    return Response.json(
      {
        success: false,
        message: "Error while sending message",
      },
      { status: 500 }
    );
  }
}
