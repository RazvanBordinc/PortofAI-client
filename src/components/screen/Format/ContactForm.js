import React, { useState, useEffect } from "react";
import {
  Send,
  User,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  ExternalLink,
  Linkedin,
  Github,
  Twitter,
  AlertCircle,
} from "lucide-react";

export default function ContactForm({ data }) {
  // State
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Process and validate data when component mounts
  useEffect(() => {
    try {
      // Handle error state from parent
      if (data && data.error) {
        setDataError(data.error);
        // Set default data for error state
        setFormData({
          title: "Contact Form",
          recipientName: "Portfolio Owner",
          recipientPosition: "Full Stack Developer",
          socialLinks: [
            {
              platform: "LinkedIn",
              url: "#",
              icon: "linkedin",
            },
          ],
          emailSubject: "Contact from Portfolio Website",
        });
        return;
      }

      // Default data if none is provided
      const defaultData = {
        title: "Contact Form",
        recipientName: "John Doe",
        recipientPosition: "Full Stack Developer",
        socialLinks: [
          {
            platform: "LinkedIn",
            url: "https://linkedin.com/in/johndoe",
            icon: "linkedin",
          },
          {
            platform: "GitHub",
            url: "https://github.com/johndoe",
            icon: "github",
          },
          {
            platform: "Twitter",
            url: "https://twitter.com/johndoe",
            icon: "twitter",
          },
        ],
        emailSubject: "Inquiry from Portfolio Website",
      };

      // Use provided data or fallback to defaults
      setFormData(data || defaultData);
    } catch (err) {
      console.error("Error setting up contact form:", err);
      setDataError("Failed to initialize contact form: " + err.message);

      // Set default data for error state
      setFormData({
        title: "Contact Form",
        recipientName: "Portfolio Owner",
        recipientPosition: "Full Stack Developer",
        socialLinks: [
          {
            platform: "LinkedIn",
            url: "#",
            icon: "linkedin",
          },
        ],
        emailSubject: "Contact from Portfolio Website",
      });
    }
  }, [data]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formState.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formState.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      // Reset form after some delay
      setTimeout(() => {
        setFormState({ name: "", email: "", phone: "", message: "" });
        setSubmitted(false);
      }, 3000);
    }, 1500);
  };

  // Get social icon based on platform
  const getSocialIcon = (platform) => {
    if (!platform) return <ExternalLink size={16} />;

    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin size={16} />;
      case "github":
        return <Github size={16} />;
      case "twitter":
        return <Twitter size={16} />;
      default:
        return <ExternalLink size={16} />;
    }
  };

  // Loading state
  if (!formData) {
    return (
      <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 p-4 text-center">
        <div className="animate-pulse">Loading contact form...</div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
          <Mail className="mr-2 h-4 w-4" />
          {formData.title || "Contact Form"}
        </h3>
      </div>

      {/* Error notification */}
      {dataError && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800/30 p-3 text-orange-800 dark:text-orange-300 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{dataError}</span>
        </div>
      )}

      {submitted ? (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <Send className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
            Message Sent!
          </h4>
          <p className="text-slate-600 dark:text-slate-300 max-w-sm">
            Thanks for reaching out to {formData.recipientName || "us"}. Your
            message has been sent successfully. You&apos;ll receive a response
            soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Form Section */}
          <div className="p-4 md:p-6 col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="name"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm`}
                    placeholder="Your name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="email"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone Input (Optional) */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="phone"
                >
                  Phone{" "}
                  <span className="text-slate-400 dark:text-slate-500 text-xs">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  htmlFor="message"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MessageSquare className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows="4"
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.message
                        ? "border-red-500 dark:border-red-500"
                        : "border-slate-300 dark:border-slate-600"
                    } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm`}
                    placeholder="Your message..."
                  />
                </div>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recipient Info Section */}
          <div className="bg-slate-50 dark:bg-slate-900/30 p-4 md:p-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-3">
                  <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                  {formData.recipientName || "Portfolio Owner"}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formData.recipientPosition || "Full Stack Developer"}
                </p>
              </div>

              {formData.socialLinks && formData.socialLinks.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Connect with me
                  </h5>
                  <ul className="space-y-2">
                    {formData.socialLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center py-1 px-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <span className="w-5 h-5 flex items-center justify-center mr-2 text-indigo-600 dark:text-indigo-400">
                            {getSocialIcon(link.icon || link.platform)}
                          </span>
                          {link.platform || "Connect"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-sm text-slate-500 dark:text-slate-400">
                <p>
                  Your data is securely processed and never shared with third
                  parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
