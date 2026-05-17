import type { Metadata } from "next";
import { getPageContent } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/motion/FadeIn";
import { CTASection } from "@/components/sections/CTASection";
import { CopyButton } from "@/components/donate/CopyButton";
import { QRZoom } from "@/components/donate/QRZoom";
import Image from "next/image";
import {
  IconLeaf,
  IconBuildingBank,
  IconDeviceMobile,
  IconShieldCheck,
  IconReceipt,
} from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Vanashree Gramvikas Pratishthan. Every contribution helps plant trees, educate children, and clean rural Maharashtra.",
};

export default async function DonatePage() {
  const page = await getPageContent();

  const bankRows = [
    { label: "Account Name", value: page.donateTrustName },
    { label: "Account Number", value: page.donateBankAccount },
    { label: "IFSC Code", value: page.donateIfsc },
    { label: "Bank", value: page.donateBankName },
    { label: "Branch", value: page.donateBankBranch },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Support Our Mission"
        title="Every Rupee Plants a Future"
        description="Your contribution helps plant trees, educate children, and keep rural Maharashtra clean and green."
      />

      {/* ─── Main donate section ─── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ─── Left: UPI / QR ─── */}
            <FadeIn direction="left">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
                  Scan &amp; Pay
                </p>

                <h2 className="mb-2 text-2xl font-bold leading-snug text-forest md:text-3xl">
                  Pay via UPI
                </h2>

                <p className="mb-8 text-sm leading-relaxed text-stone">
                  Scan the QR code with any UPI app — GPay, PhonePe, Paytm,
                  BHIM, or any banking app.
                </p>

                {/* QR card */}
                <div className="relative mb-6 overflow-hidden rounded-3xl border border-moss/15 bg-petal shadow-lg">
                  <div className="h-1 bg-linear-to-r from-leaf via-gold to-fern" />

                  <div className="flex flex-col items-center gap-5 p-6">
                    <QRZoom />

                    {/* UPI ID row */}
                    <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-moss/15 bg-white px-4 py-3">
                      <div>
                        <p className="mb-0.5 text-xs font-medium text-pebble">
                          UPI ID
                        </p>

                        <p className="text-sm font-bold tracking-wide text-forest">
                          {page.donateUpiId}
                        </p>
                      </div>

                      <CopyButton value={page.donateUpiId} label="UPI ID" />
                    </div>

                    {/* Pay Now */}
                    <a
                      href={`upi://pay?pa=${page.donateUpiId}&pn=${encodeURIComponent(
                        page.donateTrustName,
                      )}&cu=INR`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] hover:bg-canopy"
                    >
                      <IconDeviceMobile size={18} />
                      Open in UPI App
                    </a>

                    <p className="-mt-2 text-center text-xs text-pebble">
                      Works on mobile · GPay · PhonePe · Paytm · BHIM
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ─── Right: Bank Transfer ─── */}
            <FadeIn direction="right">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
                  NEFT / RTGS
                </p>

                <h2 className="mb-2 text-2xl font-bold leading-snug text-forest md:text-3xl">
                  Bank Transfer
                </h2>

                <p className="mb-8 text-sm leading-relaxed text-stone">
                  Transfer directly to our bank account for large donations or
                  institutional contributions.
                </p>

                {/* Bank details card */}
                <div className="mb-6 overflow-hidden rounded-3xl border border-moss/15 bg-petal shadow-sm">
                  <div className="h-1 bg-linear-to-r from-gold via-amber to-leaf" />

                  <div className="p-1">
                    <div className="mb-1 flex items-center gap-3 rounded-2xl bg-forest/5 px-5 py-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10">
                        <IconBuildingBank size={20} className="text-forest" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-pebble">
                          Beneficiary
                        </p>

                        <p className="text-sm font-bold text-forest">
                          {page.donateTrustName}
                        </p>
                      </div>
                    </div>

                    <div className="divide-y divide-moss/10">
                      {bankRows.slice(1).map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gold/5"
                        >
                          <div>
                            <p className="mb-0.5 text-xs font-medium text-pebble">
                              {row.label}
                            </p>

                            <p className="text-sm font-semibold tracking-wide text-forest">
                              {row.value}
                            </p>
                          </div>

                          <CopyButton value={row.value} label={row.label} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-2xl border border-leaf/15 bg-leaf/5 p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf/10">
                      <IconShieldCheck size={18} className="text-leaf" />
                    </div>

                    <div>
                      <p className="mb-0.5 text-xs font-semibold text-forest">
                        Registered Trust
                      </p>

                      <p className="text-xs leading-relaxed text-stone">
                        Vanashree Gramvikas Pratishthan · Gatewadi, Maharashtra
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                      <IconReceipt size={18} className="text-gold" />
                    </div>

                    <div>
                      <p className="mb-0.5 text-xs font-semibold text-forest">
                        Donation Receipt
                      </p>

                      <p className="text-xs leading-relaxed text-stone">
                        A receipt will be shared. WhatsApp us your transaction
                        details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ─── Donor collage ─── */}
          <FadeIn>
            <div className="mt-10 mb-6">
              <div className="mx-auto w-full max-w-6xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
                  Donor Stories
                </p>

                <h3 className="mb-2 text-2xl font-bold text-forest md:text-3xl">
                  Donations
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-stone">
                  Screenshots from people who've donated — Each one helps us
                  plant more trees.
                </p>

                {/* Mobile: simple stacked grid */}

                <div className="md:hidden grid grid-cols-2 gap-3">
                  {[
                    { file: "txn-5.jpg" },
                    { file: "txn-4.jpg" },
                    { file: "txn-2.jpg" },
                    { file: "txn-1.jpg" },
                    { file: "txn-3.jpg" },
                    { file: "txn-6.jpg" },
                  ].map((img) => (
                    <div
                      key={img.file}
                      role="button"
                      tabIndex={0}
                      className="relative overflow-hidden rounded-lg border-4 border-white/80 shadow-lg cursor-pointer will-change-transform transition-all duration-300 active:scale-105 active:-translate-y-1 active:shadow-xl"
                    >
                      <Image
                        src={`/images/donations/${img.file}`}
                        alt="Donation INR"
                        width={400}
                        height={300}
                        className="object-cover object-top w-full h-36"
                        sizes="(max-width: 768px) 50vw"
                      />
                    </div>
                  ))}
                </div>

                {/* Desktop: layered collage */}
                <div className="hidden md:block">
                  <div className="relative mx-auto min-h-112 w-full max-w-6xl overflow-hidden rounded-3xl border-8 border-moss/20 bg-cream/30 shadow-xl md:min-h-144">
                    {[
                      {
                        file: "txn-5.jpg",
                        size: "w-44 h-44 md:w-60 md:h-60",
                        top: "top-3 md:top-5",
                        left: "left-1/2 -translate-x-1/2",
                        rotate: "rotate-2",
                        z: "z-30",
                      },
                      {
                        file: "txn-4.jpg",
                        size: "w-36 h-36 md:w-48 md:h-48",
                        top: "top-20 md:top-24",
                        left: "left-3 md:left-10",
                        rotate: "-rotate-6",
                        z: "z-25",
                      },
                      {
                        file: "txn-2.jpg",
                        size: "w-36 h-36 md:w-48 md:h-48",
                        top: "top-24 md:top-28",
                        left: "right-3 md:right-10 left-auto",
                        rotate: "rotate-6",
                        z: "z-25",
                      },
                      {
                        file: "txn-1.jpg",
                        size: "w-32 h-32 md:w-40 md:h-40",
                        top: "bottom-14 md:bottom-16",
                        left: "left-1/4",
                        rotate: "-rotate-3",
                        z: "z-20",
                      },
                      {
                        file: "txn-3.jpg",
                        size: "w-24 h-24 md:w-32 md:h-32",
                        top: "bottom-3 md:bottom-5",
                        left: "left-1/2 -translate-x-1/2",
                        rotate: "rotate-2",
                        z: "z-15",
                      },
                      {
                        file: "txn-6.jpg",
                        size: "w-24 h-24 md:w-32 md:h-32",
                        top: "bottom-10 md:bottom-12",
                        left: "right-8 md:right-20 left-auto",
                        rotate: "rotate-6",
                        z: "z-15",
                      },
                    ].map((img) => (
                      <div
                        key={img.file}
                        className={`group absolute ${img.size} ${img.top} ${img.left} ${img.rotate} ${img.z} overflow-hidden rounded-lg border-4 border-white/80 shadow-lg transition-all duration-300 hover:z-30 hover:scale-110`}
                      >
                        <Image
                          src={`/images/donations/${img.file}`}
                          alt="Donation INR"
                          width={300}
                          height={300}
                          className="h-full w-full object-cover object-top"
                          sizes="(max-width: 768px) 96px, 224px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ─── Impact reminder ─── */}
          <FadeIn>
            <div className="relative mt-20 overflow-hidden rounded-3xl bg-linear-to-br from-forest to-canopy p-8 text-white md:p-10">
              <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

              <div className="relative grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                {[
                  {
                    icon: "🌳",
                    stat: "₹500",
                    label: "Plants 5 native trees",
                  },
                  {
                    icon: "📚",
                    stat: "₹1,000",
                    label: "School supplies for 2 children",
                  },
                  {
                    icon: "🧹",
                    stat: "₹2,000",
                    label: "Funds one cleanup drive",
                  },
                ].map((item) => (
                  <div
                    key={item.stat}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">{item.icon}</span>

                    <p className="text-xl font-bold text-gold">{item.stat}</p>

                    <p className="text-sm text-white/70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <CTASection
        title="Questions About Donating?"
        body="Reach out on WhatsApp or email — we'll share a donation receipt and keep you updated on how your contribution is being used."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        icon={<IconLeaf size={20} />}
      />
    </>
  );
}
