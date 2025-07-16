import { Button } from "./ui/button";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "./ui/separator";

export default function GoogleButton() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/google"; // This hits our auth URL handler
  };
  return (
    <div className="sm:w-auto w-full px-2 space-y-4">
      <div className="flex flex-nowrap items-center justify-center gap-x-2">
        <div className="flex-1">
          <Separator orientation="horizontal" className="bg-stone-600 border-1  " />
        </div>
        <p>or</p>
        <div className="flex-1">
          <Separator orientation="horizontal" className="bg-stone-600 border-1 " />
        </div>
      </div>
      <Button
        className="sm:w-100 w-full border-2 rounded-full font-bold"
        variant="outline"
        onClick={handleGoogleLogin}
      >
        <FcGoogle />
        log in with google
      </Button>
    </div>
  );
}
