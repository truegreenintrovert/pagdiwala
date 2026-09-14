import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { POLICIES } from "@/lib/constants";

export function PolicyManagement() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    content: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    if (editingPolicy) {
      setFormData({
        type: editingPolicy.type || "",
        title: editingPolicy.title || "",
        content: editingPolicy.content || ""
      });
      // Scroll to top when editing policy
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setFormData({
        type: "",
        title: "",
        content: ""
      });
    }
  }, [editingPolicy]);

  const loadPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('type');

      if (error) throw error;
      const storedPolicies = data || [];
      const defaultPolicies = Object.entries(POLICIES)
        .filter(([type]) => !storedPolicies.some((policy) => policy.type === type))
        .map(([type, policy]) => ({
          id: `default-${type}`,
          type,
          ...policy,
          updated_at: null,
          isDefault: true,
        }));

      setPolicies([...storedPolicies, ...defaultPolicies]);
    } catch (error) {
      console.error('Error loading policies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load policies"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.type.trim()) {
        throw new Error("Policy type is required");
      }
      if (!formData.title.trim()) {
        throw new Error("Policy title is required");
      }
      if (!formData.content.trim()) {
        throw new Error("Policy content is required");
      }

      const policyData = {
        type: formData.type.toLowerCase().trim(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (editingPolicy && !editingPolicy.isDefault) {
        // Update existing policy
        result = await supabase
          .from('policies')
          .update(policyData)
          .eq('id', editingPolicy.id)
          .select()
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Success",
          description: "Policy updated successfully"
        });
      } else {
        // Create new policy
        result = await supabase
          .from('policies')
          .insert([policyData])
          .select()
          .single();

        if (result.error) throw result.error;

        toast({
          title: "Success",
          description: "Policy added successfully"
        });
      }

      // Reset form and reload policies
      setEditingPolicy(null);
      setFormData({ type: "", title: "", content: "" });
      await loadPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save policy"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (policy) => {
    setEditingPolicy(policy);
    // Scroll to top when clicking edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Policy Management</h1>
        <Button onClick={() => setEditingPolicy(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingPolicy ? 'Edit Policy' : 'Add New Policy'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Policy Type *</Label>
              <Input
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., terms, privacy, refund, shipping"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Terms and Conditions"
                className="shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                name="content"
                required
                className="w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-vertical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter policy content here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              {editingPolicy && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPolicy(null)}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    {editingPolicy ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  editingPolicy ? 'Update Policy' : 'Add Policy'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {policies.map((policy) => (
          <Card key={policy.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{policy.title}</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => handleEditClick(policy)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <p className="mt-1">{policy.type}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Content</Label>
                  <p className="mt-1 whitespace-pre-wrap">{policy.content}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {policy.updated_at
                    ? `Last updated: ${new Date(policy.updated_at).toLocaleDateString()}`
                    : "Default policy — save to publish it to Supabase"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
