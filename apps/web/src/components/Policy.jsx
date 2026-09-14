import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { POLICIES } from "@/lib/constants";

export function Policy({ type }) {
  const params = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState(null);
  const policyType = type || params.type;
  const fallbackPolicy = POLICIES[policyType];

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch policy from Supabase
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from('policies')
          .select('*')
          .eq('type', policyType)
          .single();

        if (error) throw error;
        setPolicy(data || (fallbackPolicy && { type: policyType, ...fallbackPolicy }));
      } catch (error) {
        console.error('Error fetching policy:', error);
        if (fallbackPolicy) {
          setPolicy({ type: policyType, ...fallbackPolicy });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load policy"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (policyType) {
      fetchPolicy();
    }
  }, [policyType, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Policy not found</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{policy.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-gray max-w-none">
          {policy.content.split('\n').map((paragraph, index) => {
            // Check if the paragraph is a heading (starts with number and dot)
            if (/^\d+\./.test(paragraph.trim())) {
              return (
                <h3 key={index} className="text-xl font-semibold mt-6 mb-4">
                  {paragraph.trim()}
                </h3>
              );
            }
            // Check if the paragraph is a sub-point (starts with dash or bullet)
            else if (/^[-•]/.test(paragraph.trim())) {
              return (
                <li key={index} className="ml-6 mb-2">
                  {paragraph.trim().substring(1).trim()}
                </li>
              );
            }
            // Regular paragraph
            else if (paragraph.trim()) {
              return (
                <p key={index} className="mb-4">
                  {paragraph.trim()}
                </p>
              );
            }
            return null;
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
