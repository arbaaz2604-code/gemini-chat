'use client';

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

const phoneSchema = z.object({
  country: z.string().min(1, "Country is required"),
  dialCode: z.string().min(1, "Dial code is required"),
  phone: z.string().min(7, "Phone number is too short").max(15, "Phone number is too long"),
  otp: z.string().optional(),
});

type PhoneForm = z.infer<typeof phoneSchema>;

const OTP_LENGTH = 6;
// Remove SIMULATED_OTP, use state for real OTP

export default function AuthForm({ onAuthAction }: { onAuthAction: () => void }) {
  const [countries, setCountries] = useState<{
    name: string;
    code: string;
    dialCode: string;
  }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string; dialCode: string } | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string>("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [otpInputKey, setOtpInputKey] = useState(0); // to reset input

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { country: "", dialCode: "", phone: "" },
  });

  useEffect(() => {
    setLoadingCountries(true);
    setFetchError("");
    axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,idd")
      .then((res) => {
        const countryList = res.data
          .map((c: unknown) => {
            const country = c as { name: { common: string }; cca2: string; idd?: { root?: string; suffixes?: string[] } };
            let dialCode = "";
            if (country.idd && country.idd.root && Array.isArray(country.idd.suffixes) && country.idd.suffixes.length > 0) {
              dialCode = country.idd.suffixes.map((s: string) => `${country.idd && country.idd.root ? country.idd.root : ''}${s}`).join(", ");
            } else if (country.idd && country.idd.root) {
              dialCode = country.idd.root;
            }
            return {
              name: country.name.common,
              code: country.cca2,
              dialCode,
            };
          })
          .filter((c: { dialCode: string }) => c.dialCode)
          .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
        setCountries(countryList);
        setLoadingCountries(false);
      })
      .catch(() => {
        setFetchError("Failed to load countries. Please refresh.");
        setLoadingCountries(false);
      });
  }, []);

  const onSubmit: SubmitHandler<PhoneForm> = (data) => {
    if (step === "phone") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("otp");
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);
        setOtpMessage("");
        // Simulate receiving OTP after 1.5s
        setTimeout(() => {
          setOtpMessage(`Your OTP is: ${otp}`);
        }, 1500);
      }, 1000);
    } else if (step === "otp") {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (data.otp === generatedOtp) {
          onAuthAction();
        } else {
          setError("Invalid OTP");
        }
      }, 1000);
    }
  };

  const handleResend = () => {
    setResendDisabled(true);
    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpMessage("");
    setOtpInputKey(k => k + 1); // reset input
    setTimeout(() => {
      setOtpMessage(`Your OTP is: ${otp}`);
    }, 1500);
    setTimeout(() => setResendDisabled(false), 2000);
  };

  // Sync selectedCountry with form value
  React.useEffect(() => {
    if (selectedCountry) {
      setValue("country", selectedCountry.name);
      setValue("dialCode", selectedCountry.dialCode);
    }
  }, [selectedCountry, setValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md mx-auto p-0 sm:p-0 bg-transparent flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-6">
          <Image src="/globe.svg" alt="Gemini Logo" width={64} height={64} className="h-16 w-16 mb-2 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold text-center mb-2 text-blue-700 dark:text-blue-200 tracking-tight drop-shadow-lg">Gemini Chat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center text-base font-medium mb-2">Sign in to start chatting with Gemini AI</p>
        </div>
        <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 dark:border-gray-800 px-8 py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {step === "phone" && (
              <>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Country</label>
                  <Listbox value={selectedCountry} onChange={setSelectedCountry} disabled={loadingCountries || !!fetchError}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-base">
                        <span className="block truncate">
                          {selectedCountry ? `${selectedCountry.name} (${selectedCountry.dialCode})` : 'Select country'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-base">
                        {loadingCountries && (
                          <div className="px-4 py-2 text-gray-400">Loading countries...</div>
                        )}
                        {fetchError && (
                          <div className="px-4 py-2 text-red-500">{fetchError}</div>
                        )}
                        {!loadingCountries && !fetchError && countries.length === 0 && (
                          <div className="px-4 py-2 text-gray-400">No countries found</div>
                        )}
                        {!loadingCountries && !fetchError && countries.map((c) => (
                          <Listbox.Option
                            key={c.code}
                            value={c}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'}`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                  {c.name} ({c.dialCode})
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-300">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                  {errors.country && <p className="text-red-500 text-xs mt-1" aria-live="polite">{errors.country.message}</p>}
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Phone Number</label>
                  <div className="flex">
                    {selectedCountry && (
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-base">
                        {selectedCountry.dialCode}
                      </span>
                    )}
                    <input
                      className={`flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl ${selectedCountry ? 'rounded-l-none' : ''} focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50 dark:bg-gray-800 dark:text-white text-base`}
                      placeholder="Phone number"
                      {...register("phone")}
                      style={{ borderTopLeftRadius: selectedCountry ? 0 : undefined, borderBottomLeftRadius: selectedCountry ? 0 : undefined }}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1" aria-live="polite">{errors.phone.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 rounded-xl shadow-lg mt-2 disabled:opacity-60 text-lg tracking-wide"
                  disabled={loading || loadingCountries || !!fetchError}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            )}
            {step === "otp" && (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-1">Enter OTP</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-center text-sm">We sent a 6-digit code to your phone</p>
                  {otpMessage && <div className="mt-3 text-center text-base font-semibold text-green-600 dark:text-green-400 animate-fade-in">{otpMessage}</div>}
                </div>
                <input
                  key={otpInputKey}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:outline-none mb-2 text-lg tracking-widest text-center bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  maxLength={OTP_LENGTH}
                  {...register("otp", { required: true })}
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="------"
                />
                {error && <p className="text-red-500 text-xs mb-2" aria-live="polite">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 transition text-white font-bold py-3 rounded-xl shadow-lg text-lg tracking-wide mt-2"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="mt-4 text-center text-sm text-gray-400">Didn’t receive the code? <button type="button" className="text-blue-600 hover:underline font-semibold disabled:opacity-60" onClick={handleResend} disabled={resendDisabled}>Resend</button></div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 