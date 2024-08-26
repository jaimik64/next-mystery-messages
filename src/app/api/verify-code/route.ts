import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request){
    await dbConnect();

    try {
        
        const {username, code} = await req.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({username: decodedUsername});

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            }, 
            {status: 500});
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        
        if(isCodeNotExpired && isCodeValid) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: "User verified successfully"
            }, 
            {status: 200});
        } else if (!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Verification code expired, please sign up again"
            }, 
            {status: 400});
        } else {
            return Response.json({
                success: false,
                message: "Incorrect verification code"
            }, 
            {status: 400});
        }

    } catch (error) {
        console.error("Error while verifying code: " + error);       

        return Response.json({
            success: false,
            message: "Error while verifying code"
        }, 
        {status: 500});
    }
}
