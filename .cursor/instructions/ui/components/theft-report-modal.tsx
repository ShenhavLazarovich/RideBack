"use client"

import { useState } from "react"
import { X, Upload, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

export function TheftReportModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1)
  const [vehicleType, setVehicleType] = useState("bike")
  const [reward, setReward] = useState(50)
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1500)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form after closing
    setTimeout(() => {
      setStep(1)
      setVehicleType("bike")
      setReward(50)
      setImages([])
      setIsSuccess(false)
    }, 300)
  }

  const handleFileChange = (e) => {
    // In a real app, you would handle file uploads here
    setImages([...images, URL.createObjectURL(e.target.files[0])])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Report a Theft</DialogTitle>
              <DialogDescription>
                {step === 1 && "Provide details about your stolen vehicle."}
                {step === 2 && "Add photos and location information."}
                {step === 3 && "Set a reward and contact information."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vehicle-type">Vehicle Type</Label>
                    <RadioGroup
                      id="vehicle-type"
                      value={vehicleType}
                      onValueChange={setVehicleType}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bike" id="bike" />
                        <Label htmlFor="bike">Bicycle</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="e-bike" id="e-bike" />
                        <Label htmlFor="e-bike">E-Bike</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scooter" id="scooter" />
                        <Label htmlFor="scooter">E-Scooter</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="e.g., Trek FX 3 Disc - Matte Black" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your vehicle (color, size, distinguishing features, etc.)"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="serial">Serial Number (if known)</Label>
                    <Input id="serial" placeholder="e.g., WTU123X4567" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Photos</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                          <img src={image || "/placeholder.svg"} alt="Vehicle" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-black/50 p-1"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="mt-2 text-xs text-muted-foreground">Upload</span>
                          <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Last Known Location</Label>
                    <div className="flex gap-2">
                      <Input id="location" placeholder="e.g., Bedford Ave & N 7th St" className="flex-1" />
                      <Button type="button" variant="outline" size="icon">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date & Time of Theft</Label>
                    <Input id="date" type="datetime-local" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reward">Reward Amount (Optional)</Label>
                      <span className="text-sm font-medium">${reward}</span>
                    </div>
                    <Slider
                      id="reward"
                      min={0}
                      max={500}
                      step={10}
                      value={[reward]}
                      onValueChange={(value) => setReward(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Setting a reward increases the chances of recovery.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Contact Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(123) 456-7890" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      <span className="text-sm">I have also filed a police report</span>
                    </Label>
                  </div>
                </div>
              )}

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(step + 1)}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Report"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-green-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Report Submitted!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Your theft report has been submitted successfully. The community has been notified.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleClose}>View My Reports</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
