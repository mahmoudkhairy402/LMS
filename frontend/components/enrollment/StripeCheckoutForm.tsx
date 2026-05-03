"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { confirmPayment, createPaymentIntent } from "@/lib/apiService";

type StripeCheckoutFormProps = {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  accessToken: string;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function PriceLabel({ price }: { price: number }) {
  return <span>{price > 0 ? `$${price.toFixed(2)}` : "Free"}</span>;
}

function CheckoutInner({
  courseId,
  courseTitle,
  coursePrice,
  accessToken,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFreeCourse = useMemo(() => coursePrice <= 0, [coursePrice]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isFreeCourse) {
      setError("This course is free. Use the free enrollment flow.");
      return;
    }

    if (!stripe || !elements) {
      setError("Stripe is not ready yet. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card input is not ready.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const createResult = await createPaymentIntent(courseId, accessToken);

      if (!createResult.success) {
        setError(createResult.message || "Failed to start payment");
        return;
      }

      if (createResult.enrolled) {
        setSuccessMessage("You are already enrolled. Redirecting...");
        router.push(`/courses/${courseId}`);
        router.refresh();
        return;
      }

      if (!createResult.clientSecret) {
        setError("Missing payment client secret from server.");
        return;
      }

      const confirmResult = await stripe.confirmCardPayment(createResult.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (confirmResult.error) {
        setError(confirmResult.error.message || "Payment failed. Please try another card.");
        return;
      }

      const paymentIntentId = confirmResult.paymentIntent?.id;
      if (!paymentIntentId) {
        setError("Payment succeeded but no Payment Intent ID was returned.");
        return;
      }

      const backendConfirm = await confirmPayment(paymentIntentId, accessToken);
      if (!backendConfirm.success) {
        setError(backendConfirm.message || "Payment captured but enrollment confirmation failed.");
        return;
      }

      setSuccessMessage("Payment successful. Redirecting to your course...");
      router.push(`/courses/${courseId}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border-2 border-border bg-surface-raised p-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">Course</p>
        <p className="mt-2 text-lg font-black text-foreground">{courseTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Price: <span className="font-bold text-foreground"><PriceLabel price={coursePrice} /></span>
        </p>
      </div>

      <div className="border-2 border-border bg-surface-raised p-4">
        <label className="mb-2 block text-xs font-black uppercase tracking-[0.24em] text-muted-foreground">
          Card details
        </label>
        <div className="border border-border bg-background p-3">
          <CardElement
            options={{
              style: {
                base: {
                  color: "#e5e7eb",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "16px",
                  "::placeholder": {
                    color: "#94a3b8",
                  },
                },
                invalid: {
                  color: "#f87171",
                },
              },
            }}
          />
        </div>
      </div>

      {error ? (
        <div className="border-2 border-red-400 bg-red-500/10 p-3 text-sm font-semibold text-red-200">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="border-2 border-emerald-400 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !stripe || isFreeCourse}
        className="inline-flex w-full items-center justify-center border-2 border-primary-500 bg-primary-500 px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Processing payment..." : `Pay $${coursePrice.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function StripeCheckoutForm(props: StripeCheckoutFormProps) {
  if (!publishableKey || !stripePromise) {
    return (
      <div className="border-2 border-amber-400 bg-amber-500/10 p-4 text-sm text-amber-200">
        Stripe is not configured yet. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your frontend environment.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner {...props} />
    </Elements>
  );
}
