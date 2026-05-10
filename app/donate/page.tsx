import type { Metadata } from 'next'
import { getPageContent } from '@/lib/content'
import { PageHeader } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/motion/FadeIn'
import { CTASection } from '@/components/sections/CTASection'
import { CopyButton } from '@/components/donate/CopyButton'
import { QRZoom } from '@/components/donate/QRZoom'
import {
  IconLeaf,
  IconBuildingBank,
  IconDeviceMobile,
  IconShieldCheck,
  IconReceipt,
} from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support Vanashree Gramvikas Pratishthan. Every contribution helps plant trees, educate children, and clean rural Maharashtra.',
}

export default async function DonatePage() {
  const page = await getPageContent()

  const bankRows = [
    { label: 'Account Name',   value: page.donateTrustName },
    { label: 'Account Number', value: page.donateBankAccount },
    { label: 'IFSC Code',      value: page.donateIfsc },
    { label: 'Bank',           value: page.donateBankName },
    { label: 'Branch',         value: page.donateBankBranch },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Support Our Mission"
        title="Every Rupee Plants a Future"
        description="Your contribution helps plant trees, educate children, and keep rural Maharashtra clean and green."
      />

      {/* ─── Main donate section ─── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* ─── Left: UPI / QR ─── */}
            <FadeIn direction="left">
              <div>
                <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
                  Scan &amp; Pay
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-forest leading-snug mb-2">
                  Pay via UPI
                </h2>
                <p className="text-stone text-sm leading-relaxed mb-8">
                  Scan the QR code with any UPI app — GPay, PhonePe, Paytm, BHIM, or any banking app.
                </p>

                {/* QR card */}
                <div className="relative rounded-3xl overflow-hidden border border-moss/15 shadow-lg mb-6 bg-petal">
                  {/* Top accent */}
                  <div className="h-1 bg-gradient-to-r from-leaf via-gold to-fern" />
                  <div className="p-6 flex flex-col items-center gap-5">
                    <QRZoom />

                    {/* UPI ID row */}
                    <div className="w-full bg-white rounded-2xl border border-moss/15 px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-pebble font-medium mb-0.5">UPI ID</p>
                        <p className="text-forest font-bold text-sm tracking-wide">{page.donateUpiId}</p>
                      </div>
                      <CopyButton value={page.donateUpiId} label="UPI ID" />
                    </div>

                    {/* Pay Now deeplink — works on mobile */}
                    <a
                      href={`upi://pay?pa=${page.donateUpiId}&pn=${encodeURIComponent(page.donateTrustName)}&cu=INR`}
                      className="w-full flex items-center justify-center gap-2 bg-forest hover:bg-canopy text-white font-semibold text-sm py-3.5 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
                    >
                      <IconDeviceMobile size={18} />
                      Open in UPI App
                    </a>
                    <p className="text-xs text-pebble text-center -mt-2">
                      Works on mobile · GPay · PhonePe · Paytm · BHIM
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ─── Right: Bank Transfer ─── */}
            <FadeIn direction="right">
              <div>
                <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
                  NEFT / RTGS
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-forest leading-snug mb-2">
                  Bank Transfer
                </h2>
                <p className="text-stone text-sm leading-relaxed mb-8">
                  Transfer directly to our bank account for large donations or institutional contributions.
                </p>

                {/* Bank details card */}
                <div className="rounded-3xl border border-moss/15 overflow-hidden shadow-sm bg-petal mb-6">
                  <div className="h-1 bg-gradient-to-r from-gold via-amber to-leaf" />
                  <div className="p-1">
                    <div className="bg-forest/5 rounded-2xl px-5 py-4 mb-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
                        <IconBuildingBank size={20} className="text-forest" />
                      </div>
                      <div>
                        <p className="text-xs text-pebble font-medium">Beneficiary</p>
                        <p className="text-forest font-bold text-sm">{page.donateTrustName}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-moss/10">
                      {bankRows.slice(1).map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-gold/5 transition-colors"
                        >
                          <div>
                            <p className="text-xs text-pebble font-medium mb-0.5">{row.label}</p>
                            <p className="text-forest font-semibold text-sm tracking-wide">{row.value}</p>
                          </div>
                          <CopyButton value={row.value} label={row.label} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 bg-leaf/5 border border-leaf/15 rounded-2xl p-4">
                    <div className="w-9 h-9 rounded-xl bg-leaf/10 flex items-center justify-center shrink-0 mt-0.5">
                      <IconShieldCheck size={18} className="text-leaf" />
                    </div>
                    <div>
                      <p className="text-forest font-semibold text-xs mb-0.5">Registered Trust</p>
                      <p className="text-stone text-xs leading-relaxed">
                        Vanashree Gramvikas Pratishthan · Gatewadi, Maharashtra
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gold/5 border border-gold/15 rounded-2xl p-4">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <IconReceipt size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-forest font-semibold text-xs mb-0.5">Donation Receipt</p>
                      <p className="text-stone text-xs leading-relaxed">
                        A receipt will be shared. WhatsApp us your transaction details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ─── Impact reminder ─── */}
          <FadeIn>
            <div className="mt-20 rounded-3xl bg-gradient-to-br from-forest to-canopy p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gold/10 blur-3xl rounded-full" />
              <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                {[
                  { icon: '🌳', stat: '₹500',   label: 'Plants 5 native trees' },
                  { icon: '📚', stat: '₹1,000',  label: 'School supplies for 2 children' },
                  { icon: '🧹', stat: '₹2,000',  label: 'Funds one cleanup drive' },
                ].map((item) => (
                  <div key={item.stat} className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{item.icon}</span>
                    <p className="text-gold font-bold text-xl">{item.stat}</p>
                    <p className="text-white/70 text-sm">{item.label}</p>
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
  )
}
