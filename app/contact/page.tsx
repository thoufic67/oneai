// Contact Page
// This file renders the contact page for the app, using HeroUI components, Tailwind, and Lucide icons. It provides users with ways to contact support via email or Discord.
"use client";
import { title, subtitle } from "@/app/components/primitives";
import { Mail, UploadCloud } from "lucide-react";
import { Button } from "@heroui/button";
import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Textarea, Select, SelectItem } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

const EMAIL = "thoufic@achieveit.ai";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Handle file upload to /api/upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });
      if (res.status === 401 || res.status === 403) {
        setError(
          "You must be logged in to upload files. Please login to contact us."
        );
        setFileUrl(null);
        setFileUploading(false);
        return;
      }
      if (!res.ok) throw new Error("File upload failed");
      const data = await res.json();
      setFileUrl(data.url || null);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      setFileUrl(null);
    } finally {
      setFileUploading(false);
    }
  };

  const validateForm = () => {
    if (!issueType) {
      setError("Please select an issue type.");
      return false;
    }
    if (!description.trim()) {
      setError("Please enter a description of the issue.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    // Simple email regex
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (fileUploading) {
      setError("Please wait for the file to finish uploading.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!validateForm()) {
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType,
          description,
          email,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send feedback. Please try again.");
        setSuccess(false);
      } else {
        setSuccess(true);
        setIssueType("");
        setDescription("");
        setEmail("");
        setFile(null);
        setFileUrl(null);
      }
    } catch (err: any) {
      setError(err.message || "Unknown error occurred.");
      setSuccess(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen  py-12">
      <h1 className={title() + " text-brown-800 m-2"}>Contact Us</h1>
      <form
        className="w-full max-w-2xl bg-white rounded-xl shadow p-8 flex flex-col gap-6"
        onSubmit={handleSubmit}
      >
        {/* Issue Type */}
        <div>
          <label
            htmlFor="issue-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Issue type
          </label>
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="w-full justify-between"
                id="issue-type"
                type="button"
                variant="bordered"
              >
                {issueType ? issueType : "Please select an issue type"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Issue type"
              className="w-full"
              onAction={(key) => setIssueType(key as string)}
            >
              <DropdownItem key="Feature request">Feature request</DropdownItem>
              <DropdownItem key="Issue report">Bug report</DropdownItem>
              <DropdownItem key="Membership and payment issue">
                Membership and payment issue
              </DropdownItem>
              <DropdownItem key="Account issue">Account issue</DropdownItem>
              <DropdownItem key="Other">Other</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        {/* Issue Description */}
        <div>
          <label
            htmlFor="issue-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Issue description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="issue-description"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please tell us what you were trying to do, what unexpected behavior you noticed, and whether you saw any error messages along the way."
            required
            rows={6}
            value={description}
          />
        </div>
        {/* File Upload */}
        <div>
          <label
            htmlFor="attachment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Attachment
          </label>
          <div className="flex items-center gap-3">
            <button
              aria-label="Upload file"
              className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center w-24 h-24 bg-gray-50 hover:bg-gray-100"
              id="attachment"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <UploadCloud className="w-6 h-6 text-gray-400" />
            </button>
            <input
              accept="image/*,application/pdf,.doc,.docx,.txt"
              className="hidden"
              id="attachment-input"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            {file && <span className="text-sm text-gray-700">{file.name}</span>}
            {fileUploading && (
              <span className="text-xs text-blue-500">Uploading...</span>
            )}
            {fileUrl && !fileUploading && (
              <a
                className="text-xs text-blue-600 underline"
                href={fileUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                View file
              </a>
            )}
          </div>
        </div>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your email
          </label>
          <Input
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        {/* Error/Success */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && (
          <div className="text-green-600 text-sm">
            Feedback sent! Thank you.
          </div>
        )}
        {/* Send Button */}
        <Button
          type="submit"
          className="w-full"
          variant="solid"
          color="primary"
          isLoading={sending}
          disabled={sending || fileUploading}
        >
          Send
        </Button>
      </form>
      {/* Contact Info Card */}
      <div className="w-full max-w-2xl mt-8 bg-neutral-100 rounded-xl p-6 flex flex-col gap-2">
        <div className="font-semibold text-gray-800 mb-1">Contact us</div>
        <div className="text-sm text-gray-600">
          You can also contact us via email.
        </div>
        <a
          href={`mailto:${EMAIL}`}
          className="text-blue-600 text-sm underline flex items-center gap-1"
        >
          <Mail className="w-4 h-4 inline-block" /> {EMAIL}
        </a>
        <Button
          className="mt-2 w-fit"
          variant="bordered"
          color="primary"
          onPress={handleCopy}
          aria-label="Copy Email"
        >
          {copied ? "Copied!" : "Copy Email"}
        </Button>
      </div>
    </div>
  );
}
