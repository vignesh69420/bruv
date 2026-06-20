import { ProfileForm } from "@/components/settings/profile-form";
import { LinkedAccounts } from "@/components/settings/linked-accounts";
import { MemorySection } from "@/components/settings/memory-section";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <ProfileForm />
      <LinkedAccounts />
      <MemorySection />
    </div>
  );
}
