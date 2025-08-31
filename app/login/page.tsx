"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { redirect, useRouter } from "next/navigation";
import { Card } from "@heroui/react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { ShineBorder } from "@/components/magicui/shine-border";
import { User } from "@supabase/supabase-js";
import AnimatedGradientBackground from "@/components/background-gradient-animation";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    handleRedirect();
  }, []);

  const handleRedirect = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      toast.error("error fetching user:" + error);
    } else {
      setUser(user);
      toast.success("you are loged in");
      redirect("/");
    }
    return user;
  };

  // Function to handle login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("All fields are required.");
      setIsLoading(false);
      return;
    }

    const loginPromise = supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    const { error } = await loginPromise;

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Login successful!");
      router.push("/"); // Redirect after successful login
    }
    setIsLoading(false);
  };

  // Function to handle sign up
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    const fullName = firstName + " " + lastName;

    const signUpPromise = supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    const { error } = await signUpPromise;

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(
        "Account created successfully! Please check your email for a verification link."
      );
      // Optionally, switch to login form after successful signup
      setIsLogin(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
    }
    setIsLoading(false);
  };

  return (
    <AnimatedGradientBackground>
      <div className="flex min-h-screen items-center justify-center dark:bg-black">
        <BackgroundBeams />
        {!user ? (
          <Card className="mx-auto border w-full max-w-md bg-gray-50 p-4 md:rounded-2xl md:p-8 dark:bg-black shadow-2xl shadow-teal-200">
            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
              Welcome to Prob Solution
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
              {isLogin ? "Log in to your account." : "Create a new account."}
            </p>

            <form
              className="my-8 shadow-input"
              onSubmit={isLogin ? handleLogin : handleSignUp}
            >
              {!isLogin && (
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <LabelInputContainer>
                    <Label htmlFor="firstname">First name</Label>
                    <Input
                      id="firstname"
                      placeholder="Ahmad"
                      type="text"
                      className="outline-1"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </LabelInputContainer>
                  <LabelInputContainer>
                    <Label htmlFor="lastname">Last name</Label>
                    <Input
                      id="lastname"
                      placeholder="Aslam"
                      type="text"
                      className="outline-1"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </LabelInputContainer>
                </div>
              )}
              <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="projectmayhem@fc.com"
                  type="email"
                  className="outline-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  className="outline-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </LabelInputContainer>
              {!isLogin && (
                <LabelInputContainer className="mb-8">
                  <Label htmlFor="confirmpassword">Confirm Password</Label>
                  <Input
                    id="confirmpassword"
                    placeholder="••••••••"
                    type="password"
                    className="outline-1"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </LabelInputContainer>
              )}

              <button
                className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] disabled:cursor-not-allowed dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? isLogin
                    ? "Logging in..."
                    : "Signing up..."
                  : isLogin
                    ? "Log in"
                    : "Sign up"}
                &rarr;
                <BottomGradient />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button className="text-sm text-neutral-600 dark:text-neutral-300">
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <strong
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      Sign up
                    </strong>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <strong
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      Log in
                    </strong>
                  </p>
                )}
              </button>
            </div>
          </Card>
        ) : (
          "You are Already loggedIn"
        )}
      </div>
    </AnimatedGradientBackground>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
