import { ProfileForm } from "@/components/settings/profile-form";
import { MemorySection } from "@/components/settings/memory-section";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <ProfileForm />
      <MemorySection />
    </div>
  );
}
