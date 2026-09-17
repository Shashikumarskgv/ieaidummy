"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Sliders,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function GatewaySettingsPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getGatewaySettings();
      setGateways(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load payment gateway settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateGateway = async (gw: any) => {
    try {
      setSavingCode(gw.gateway_code);
      const cfg = typeof gw.config_json === 'string' ? JSON.parse(gw.config_json) : (gw.config_json || {});
      await FinanceService.updateGatewaySettings({
        gatewayCode: gw.gateway_code,
        isActive: Boolean(gw.is_active),
        environment: gw.environment || 'test',
        configJson: cfg
      });
      toast.success(`${gw.gateway_name} settings updated successfully!`);
      loadSettings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update gateway settings");
    } finally {
      setSavingCode(null);
    }
  };

  const handleToggleActive = (idx: number, val: boolean) => {
    const updated = [...gateways];
    updated[idx].is_active = val ? 1 : 0;
    setGateways(updated);
  };

  const handleEnvChange = (idx: number, env: string) => {
    const updated = [...gateways];
    updated[idx].environment = env;
    setGateways(updated);
  };

  const handleKeyIdChange = (idx: number, keyId: string) => {
    const updated = [...gateways];
    const cfg = typeof updated[idx].config_json === 'string' ? JSON.parse(updated[idx].config_json) : (updated[idx].config_json || {});
    cfg.key_id = keyId;
    updated[idx].config_json = cfg;
    setGateways(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary shrink-0" />
            Payment Gateway Configurations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure dynamic credentials, test/live environments, and webhook security for Razorpay & Zoho Payments.
          </p>
        </div>

        <Button size="sm" onClick={loadSettings} className="rounded-xl gap-2 text-xs font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh Settings
        </Button>
      </div>

      {/* Gateway Configuration Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gateways.map((gw, idx) => {
            const cfg = typeof gw.config_json === 'string' ? JSON.parse(gw.config_json) : (gw.config_json || {});
            const isRazorpay = gw.gateway_code === 'razorpay';

            return (
              <div key={gw.id || idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                      isRazorpay ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}>
                      {isRazorpay ? 'RZP' : 'ZOHO'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{gw.gateway_name}</h3>
                      <p className="text-xs text-muted-foreground">Gateway Code: {gw.gateway_code}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                    gw.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {gw.is_active ? <CheckCircle2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span>{gw.is_active ? 'Active' : 'Disabled'}</span>
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                    <div>
                      <Label className="font-bold text-foreground">Enable Gateway</Label>
                      <p className="text-[11px] text-muted-foreground">Allow students to checkout using this gateway.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(gw.is_active)}
                      onChange={(e) => handleToggleActive(idx, e.target.checked)}
                      className="w-5 h-5 accent-primary rounded cursor-pointer"
                    />
                  </div>

                  {/* Environment Mode */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-muted-foreground">Environment Mode</Label>
                    <Select value={gw.environment || 'test'} onValueChange={(val) => handleEnvChange(idx, val)}>
                      <SelectTrigger className="rounded-xl border-border text-xs h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border text-xs">
                        <SelectItem value="test">Test / Sandbox Mode</SelectItem>
                        <SelectItem value="live">Production / Live Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Key ID / Public Key */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-muted-foreground">Gateway Public Key ID</Label>
                    <Input
                      type="text"
                      placeholder="e.g. rzp_test_..."
                      value={cfg.key_id || ''}
                      onChange={(e) => handleKeyIdChange(idx, e.target.value)}
                      className="rounded-xl border-border font-mono text-xs h-10"
                    />
                  </div>

                  {/* Secret Note */}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
                    💡 Secret Key is securely resolved from environment variables (<code className="font-bold">{isRazorpay ? 'RAZORPAY_KEY_SECRET' : 'ZOHO_PAYMENTS_SECRET_KEY'}</code>).
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => handleUpdateGateway(gw)}
                      disabled={savingCode === gw.gateway_code}
                      className="rounded-xl gap-2 text-xs font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      {savingCode === gw.gateway_code ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
