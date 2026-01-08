"use client"

import { PolicyGenerator } from "@/features/privacy/components/policy-generator"

export default function PolicyGeneratorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Privacy Policy Generator</h3>
                <p className="text-sm text-muted-foreground">
                    Create a compliant privacy policy for your business in minutes.
                </p>
            </div>
            <PolicyGenerator />
        </div>
    )
}
