import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SocialMediaManagement() {
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    whatsapp: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialMedia();
  }, []);

  const loadSocialMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media')
        .select('*');

      if (error) throw error;

      const socialLinks = {};
      data.forEach(item => {
        socialLinks[item.platform.toLowerCase()] = item.url;
      });

      setSocialMedia({
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        whatsapp: socialLinks.whatsapp || ""
      });
    } catch (error) {
      console.error('Error loading social media:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load social media links"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare the data for upsert with icons
      const updates = [
        {
          platform: "Facebook",
          url: socialMedia.facebook.trim(),
          icon: "facebook"
        },
        {
          platform: "Instagram",
          url: socialMedia.instagram.trim(),
          icon: "instagram"
        },
        {
          platform: "WhatsApp",
          url: socialMedia.whatsapp.trim(),
          icon: "whatsapp"
        }
      ];

      // Delete existing records
      await supabase
        .from('social_media')
        .delete()
        .neq('platform', 'dummy');

      // Insert new records
      const { error } = await supabase
        .from('social_media')
        .insert(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social media links updated successfully"
      });

      loadSocialMedia();
    } catch (error) {
      console.error('Error saving social media:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update social media links"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Social Media Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit Social Media Links</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Facebook URL
                </Label>
                <Input
                  type="url"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia(prev => ({
                    ...prev,
                    facebook: e.target.value
                  }))}
                  placeholder="https://facebook.com/your-page"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  Instagram URL
                </Label>
                <Input
                  type="url"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia(prev => ({
                    ...prev,
                    instagram: e.target.value
                  }))}
                  placeholder="https://instagram.com/your-profile"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp URL
                </Label>
                <Input
                  type="url"
                  value={socialMedia.whatsapp}
                  onChange={(e) => setSocialMedia(prev => ({
                    ...prev,
                    whatsapp: e.target.value
                  }))}
                  placeholder="https://wa.me/your-number"
                />
                <p className="text-sm text-muted-foreground">
                  Format: https://wa.me/91XXXXXXXXXX (include country code without +)
                </p>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}