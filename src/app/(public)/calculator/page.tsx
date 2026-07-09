import EarningsCalculator from "@/components/public/earnings-calculator";

export const metadata = {
  title: "Earnings Calculator | WeShare by OrenGen",
  description:
    "See what you could earn as a WeShare Referral Partner, Sales Partner, or Partner Leader. Pick a package, choose your track, adjust the numbers.",
};

export default function CalculatorPage() {
  return <EarningsCalculator />;
}
