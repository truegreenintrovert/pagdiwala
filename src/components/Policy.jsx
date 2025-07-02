
import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POLICIES } from "@/lib/constants";

export function Policy({ type }) {
  // Get policy type from props or params
  const params = useParams();
  const policyType = type || params.type;
  const policy = POLICIES[policyType];

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
