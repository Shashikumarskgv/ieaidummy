const fs = require('fs');
const filepath = 'c:/lms-b2b/components/dq-admin/college/create/page.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// We want to find the LAST totalDepartments metrics:
const targetStr = `                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Departments:</span>
                  <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md font-mono">{summaryDetails.totalDepartments}</span>
                </div>`;

const index = content.lastIndexOf(targetStr);
if (index === -1) {
    console.error("Could not find target string!");
    process.exit(1);
}

// We want to keep everything from start up to targetStr + closing divs of Panel 4
const keepContent = content.substring(0, index + targetStr.length) + `
              </div>
            </div>
          </div>
        )}
`;

// Now add the Step 5 Branding and Bottom Sticky Footer:
const restContent = `
        {/* STEP 5: Branding */}
        {currentStep === 5 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Branding & Identity Assets</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Logo */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Upload Logo</Label>
                <div className="border border-dashed border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/30 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {logoPreview ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-border relative">
                      <img src={logoPreview} alt="Logo preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {logoName || "Select Logo"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Cover */}
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Upload Cover Banner</Label>
                <div className="border border-dashed border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/30 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {coverPreview ? (
                    <div className="w-full h-20 rounded-xl overflow-hidden border border-border relative">
                      <img src={coverPreview} alt="Cover preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {coverName || "Select Cover"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-lg lg:pl-64 transition-all duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dq-admin/college")}
              className="rounded-xl px-6 text-xs font-bold"
            >
              Cancel
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                type="button"
                onClick={handleBack}
                className="rounded-xl px-5 text-xs font-bold"
              >
                Back
              </Button>
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-xl px-6 text-xs font-bold flex items-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground shadow"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateCollege}
                disabled={isSubmitting}
                className="rounded-xl px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
              >
                {isSubmitting ? "Creating..." : "Create College"}
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
`;

fs.writeFileSync(filepath, keepContent + restContent, 'utf8');
console.log("Successfully fixed college create page file with lastIndexOf!");
