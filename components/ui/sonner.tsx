
"use client";

import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  type ToasterProps,
} from "sonner";

import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-5" />
        ),
        info: (
          <InfoIcon className="size-5" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5" />
        ),
        error: (
          <OctagonXIcon className="size-5" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 4500,

        classNames: {
          // Base Toast                                                   

          toast: `
            group
            relative
            w-full
            max-w-[420px]
            min-h-[88px]
            overflow-hidden
            rounded-xl
            border
            bg-white
            px-4
            py-4
            pr-11
            shadow-[0_12px_35px_rgba(15,23,42,0.12)]
            transition-all
            duration-200

            dark:bg-slate-900
          `,

          // Title                                                          */

          title: `
            text-sm
            font-semibold
            leading-5
            text-slate-900

            dark:text-slate-50
          `,

          // Description                                                  

          description: `
            mt-1
            text-xs
            leading-5
            text-slate-500

            dark:text-slate-400
          `,

          // Close Button                                                  

          closeButton: `
            absolute
            right-3
            top-3

            flex
            size-6
            items-center
            justify-center

            rounded-md
            border
            border-slate-200
            bg-white

            text-slate-400

            transition-colors
            hover:bg-slate-50
            hover:text-slate-700

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-400
            dark:hover:bg-slate-700
            dark:hover:text-slate-200
          `,

          // Success                                                       

          success: `
            border-emerald-200

            before:absolute
            before:left-0
            before:top-0
            before:h-full
            before:w-1
            before:bg-emerald-500

            [&_[data-icon]]:text-emerald-600

            dark:border-emerald-900/70
            dark:before:bg-emerald-500
            dark:[&_[data-icon]]:text-emerald-400
          `,

          /* -------------------------------------------------------------- */
          /* Error                                                          */
          /* -------------------------------------------------------------- */

          error: `
            border-rose-200

            before:absolute
            before:left-0
            before:top-0
            before:h-full
            before:w-1
            before:bg-rose-500

            [&_[data-icon]]:text-rose-600

            dark:border-rose-900/70
            dark:before:bg-rose-500
            dark:[&_[data-icon]]:text-rose-400
          `,

          // Warning                                                        

          warning: `
            border-amber-200

            before:absolute
            before:left-0
            before:top-0
            before:h-full
            before:w-1
            before:bg-amber-500

            [&_[data-icon]]:text-amber-600

            dark:border-amber-900/70
            dark:before:bg-amber-500
            dark:[&_[data-icon]]:text-amber-400
          `,

          // Info                                                          

          info: `
            border-sky-200

            before:absolute
            before:left-0
            before:top-0
            before:h-full
            before:w-1
            before:bg-sky-500

            [&_[data-icon]]:text-sky-600

            dark:border-sky-900/70
            dark:before:bg-sky-500
            dark:[&_[data-icon]]:text-sky-400
          `,

          // Loading                                                        

          loading: `
            border-indigo-200

            before:absolute
            before:left-0
            before:top-0
            before:h-full
            before:w-1
            before:bg-indigo-500

            [&_[data-icon]]:text-indigo-600

            dark:border-indigo-900/70
            dark:before:bg-indigo-500
            dark:[&_[data-icon]]:text-indigo-400
          `,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

