import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    address: "",
    whatsapp: "",
    facebook: "",
    instagram: ""
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // Fetch contact info
        const { data: contactData, error: contactError } = await supabase
          .from('contact_info')
          .select('*');

        if (contactError) throw contactError;

        // Fetch social media links
        const { data: socialData, error: socialError } = await supabase
          .from('social_media')
          .select('*');

        if (socialError) throw socialError;

        // Process contact info
        const info = {};
        contactData.forEach(item => {
          info[item.type] = item.value;
        });

        // Process social media links
        const socialLinks = {};
        socialData.forEach(item => {
          socialLinks[item.platform.toLowerCase()] = item.url;
        });

        setContactInfo({
          email: info.email || "",
          phone: info.phone || "",
          address: info.address || "",
          whatsapp: socialLinks.whatsapp || "",
          facebook: socialLinks.facebook || "",
          instagram: socialLinks.instagram || ""
        });
      } catch (error) {
        console.error('Error fetching contact info:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load contact information"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [toast]);

  return { contactInfo, loading };
}