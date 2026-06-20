"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileForm() {
  const { profile, isLoading, saveProfile, isSaving } = useProfile();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [locale, setLocale] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setBio(profile.bio ?? "");
    setTimezone(profile.timezone ?? "");
    setLocale(profile.locale ?? "");
    setPhoneNumber(profile.phoneNumber ?? "");
  }, [profile]);

  async function onSave() {
    try {
      await saveProfile({
        name,
        bio,
        timezone,
        locale,
        phoneNumber: phoneNumber.trim() ? phoneNumber.trim() : null,
      });
      toast.success("profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "failed to save");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>profile</CardTitle>
        <CardDescription>
          how bruv knows you. your phone number links iMessage to this account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">name</Label>
          <Input
            id="name"
            value={name}
            disabled={isLoading}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">email</Label>
          <Input id="email" value={profile?.email ?? ""} disabled readOnly />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">phone (E.164, for iMessage)</Label>
          <Input
            id="phone"
            placeholder="+33612345678"
            value={phoneNumber}
            disabled={isLoading}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="timezone">timezone</Label>
            <Input
              id="timezone"
              placeholder="Europe/London"
              value={timezone}
              disabled={isLoading}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </div>
          <div className="flex w-32 flex-col gap-2">
            <Label htmlFor="locale">language</Label>
            <Input
              id="locale"
              placeholder="en"
              value={locale}
              disabled={isLoading}
              onChange={(e) => setLocale(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bio">bio</Label>
          <Textarea
            id="bio"
            rows={3}
            placeholder="a line or two about you"
            value={bio}
            disabled={isLoading}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={onSave} disabled={isSaving || isLoading}>
            {isSaving ? "saving…" : "save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
