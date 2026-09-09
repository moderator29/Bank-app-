"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  Headphones,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Surface, IconTile, Chip } from "@/components/ui/surface";
import { ListGroup, ListRow } from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { useBank } from "@/lib/store";
import { unreadCount } from "@/lib/selectors";

export default function ProfilePage() {
  const router = useRouter();
  const user = useBank((s) => s.user);
  const devices = useBank((s) => s.devices);
  const unread = useBank(unreadCount);
  const lock = useBank((s) => s.lock);
  const signOut = useBank((s) => s.signOut);
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);

  const memberYear = new Date(user.memberSince).getFullYear();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Profile" subtitle="Your details, settings and support" />

      <Surface index={0} className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-tight text-ink-900">
              {user.name}
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink-400">{user.email}</p>
            <div className="mt-2">
              <Chip tone="brass">Member since {memberYear}</Chip>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/profile/personal")}
          >
            Edit details
          </Button>
          <Button variant="subtle" size="sm" onClick={() => router.push("/security")}>
            Security centre
          </Button>
        </div>
      </Surface>

      <div className="mt-6 space-y-6">
        <ListGroup label="Account">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <UserRound />
              </IconTile>
            }
            title="Personal information"
            detail="Name, contact details and address"
            href="/profile/personal"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <FileText />
              </IconTile>
            }
            title="Statements & documents"
            detail="Monthly statements and tax forms"
            href="/documents"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Bell />
              </IconTile>
            }
            title="Notifications"
            detail={unread > 0 ? `${unread} unread` : "You're all caught up"}
            href="/notifications"
          />
        </ListGroup>

        <ListGroup label="Preferences">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <ShieldCheck />
              </IconTile>
            }
            title="Security"
            detail={`Passcode, ${devices.length} trusted device${devices.length === 1 ? "" : "s"}`}
            href="/security"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Settings />
              </IconTile>
            }
            title="Settings"
            detail="Appearance, notifications and privacy"
            href="/settings"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Headphones />
              </IconTile>
            }
            title="Support"
            detail="Help centre and conversations"
            href="/support"
          />
        </ListGroup>

        <ListGroup>
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Lock />
              </IconTile>
            }
            title="Lock app"
            detail="Require your passcode to continue"
            onClick={() => {
              lock();
              router.push("/passcode");
            }}
            chevron={false}
          />
          <ListRow
            icon={
              <IconTile tone="neg">
                <LogOut />
              </IconTile>
            }
            title="Sign out"
            detail="End this session on this device"
            tone="danger"
            onClick={() => setConfirmSignOut(true)}
            chevron={false}
          />
        </ListGroup>
      </div>

      <p className="mt-6 px-1 text-center text-2xs text-ink-300">
        Auremont Bank · Member FDIC · Equal Housing Lender
      </p>

      <Sheet
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title="Sign out?"
        description="You'll need your email, password and passcode to sign back in."
      >
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="danger"
            block
            onClick={() => {
              setConfirmSignOut(false);
              signOut();
              router.push("/signin");
            }}
          >
            Sign out
          </Button>
          <Button variant="ghost" block onClick={() => setConfirmSignOut(false)}>
            Stay signed in
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
