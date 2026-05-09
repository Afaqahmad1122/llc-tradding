"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { createCustomerReview } from "@/lib/api/reviews";
import {
  PENDING_REVIEW_ELIGIBILITY_QUERY_KEY,
  usePendingReviewEligibilityQuery,
} from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const MIN_COMMENT = 10;

export default function SubmitReviewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  const eligibilityQuery = usePendingReviewEligibilityQuery();
  const pending = eligibilityQuery.data?.data ?? [];
  const eligibilityReady =
    hasBootstrapped && Boolean(user?.id) && eligibilityQuery.isFetched;

  const [eligibilityId, setEligibilityId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [country, setCountry] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (pending.length === 0) {
      setEligibilityId("");
      return;
    }
    setEligibilityId((prev) =>
      prev && pending.some((row) => row.id === prev) ? prev : pending[0].id,
    );
  }, [pending]);

  useEffect(() => {
    if (!hasBootstrapped) return;
    if (!user?.id) return;
    if (!user.country) return;
    setCountry((c) => (c.trim() ? c : user.country ?? ""));
  }, [hasBootstrapped, user?.country, user?.id]);

  const mutation = useMutation({
    mutationFn: createCustomerReview,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: PENDING_REVIEW_ELIGIBILITY_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["public-reviews-page"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["public-reviews"],
        }),
      ]);
      toast.success("Thanks — your review was submitted.");
      router.push("/reviews");
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);

    const body = comment.trim();
    if (!eligibilityId) {
      setClientError("No active review invitation found for your account.");
      return;
    }
    if (body.length < MIN_COMMENT) {
      setClientError(`Please write at least ${MIN_COMMENT} characters in your review.`);
      return;
    }

    mutation.mutate({
      eligibilityId,
      rating,
      comment: body,
      ...(title.trim() ? { title: title.trim() } : {}),
      ...(country.trim() ? { country: country.trim() } : {}),
    });
  };

  if (!hasBootstrapped) {
    return (
      <LandingPageShell mainClassName="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
        <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading…</p>
      </LandingPageShell>
    );
  }

  if (!user) {
    return (
      <LandingPageShell mainClassName="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]/85">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1E104E] dark:text-white">
              Sign in to leave a review
            </CardTitle>
            <CardDescription>
              When your sales team enables feedback for your account, the option to write a review
              appears after you sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create account</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/reviews">Back to reviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </LandingPageShell>
    );
  }

  if (!eligibilityReady) {
    return (
      <LandingPageShell mainClassName="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
        <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Checking your account…</p>
      </LandingPageShell>
    );
  }

  if (pending.length === 0) {
    return (
      <LandingPageShell mainClassName="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]/85">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1E104E] dark:text-white">
              No review invitation
            </CardTitle>
            <CardDescription>
              Reviews open only after ICC Trading enables them for your buyer account. Contact your
              representative if you completed a purchase and believe this is a mistake.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/reviews">Back to reviews</Link>
            </Button>
          </CardFooter>
        </Card>
      </LandingPageShell>
    );
  }

  const apiMessage =
    mutation.error instanceof ApiError ? mutation.error.message : null;

  return (
    <LandingPageShell mainClassName="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-4xl">
            Write a review
          </h1>
          <p className="mt-2 text-base text-[#452E5A]/85 dark:text-white/75">
            Your team enabled this for your account — no reference code is needed. Submit once per
            invitation below.
          </p>
        </div>

        <Card className="border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]/85">
          <CardHeader>
            <CardTitle className="text-lg text-[#1E104E] dark:text-white">
              Your feedback
            </CardTitle>
            <CardDescription>
              Signed in as <span className="text-foreground font-medium">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="submit-review-form" className="space-y-6" onSubmit={handleSubmit}>
              {pending.length > 1 ? (
                <div className="space-y-2">
                  <Label htmlFor="review-eligibility-pick">Invitation</Label>
                  <NativeSelect
                    id="review-eligibility-pick"
                    value={eligibilityId}
                    onChange={(e) => setEligibilityId(e.target.value)}
                    className="w-full max-w-md"
                  >
                    {pending.map((row, index) => (
                      <NativeSelectOption key={row.id} value={row.id}>
                        Review {index + 1}
                        {row.carId ? ` · vehicle ${row.carId.slice(0, 8)}…` : ""}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <p className="text-muted-foreground text-xs">
                    You have more than one pending review. Pick which purchase this feedback is for.
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label id="rating-label">Rating</Label>
                <div
                  className="flex gap-1"
                  role="group"
                  aria-labelledby="rating-label"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="rounded-md p-0.5 transition-colors hover:bg-[#452E5A]/10 dark:hover:bg-white/10"
                      aria-label={`${n} out of 5 stars`}
                      aria-pressed={n === rating}
                    >
                      <Star
                        className={cn(
                          "size-9 sm:size-10",
                          n <= rating
                            ? "fill-amber-400 text-amber-500"
                            : "fill-transparent text-[#452E5A]/35 dark:text-white/30",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">{rating} of 5 stars</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-title">Title (optional)</Label>
                <Input
                  id="review-title"
                  name="title"
                  placeholder="Short headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Review</Label>
                <Textarea
                  id="review-comment"
                  name="comment"
                  required
                  minLength={MIN_COMMENT}
                  placeholder="Tell us how delivery and the vehicle matched your expectations..."
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-32 resize-y"
                />
                <p className="text-muted-foreground text-xs">
                  Minimum {MIN_COMMENT} characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-country">Country (optional)</Label>
                <Input
                  id="review-country"
                  name="country"
                  placeholder="Your country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              {clientError ? (
                <p className="text-sm text-[#b42318] dark:text-[#ff9b99]" role="alert">
                  {clientError}
                </p>
              ) : null}
              {apiMessage ? (
                <p className="text-sm text-[#b42318] dark:text-[#ff9b99]" role="alert">
                  {apiMessage}
                </p>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
            <Button type="submit" form="submit-review-form" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting…" : "Submit review"}
            </Button>
            <Button variant="outline" type="button" asChild disabled={mutation.isPending}>
              <Link href="/reviews">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </LandingPageShell>
  );
}
