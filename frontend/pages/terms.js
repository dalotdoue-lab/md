import Layout from '../components/common/Layout'
import Link from 'next/link'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Let Investments' website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`,
  },
  {
    title: '2. Use of Services',
    content: `Our services are intended for individuals and businesses seeking investment management, engineering solutions, and technology consulting. You agree to use our services only for lawful purposes and in a manner consistent with all applicable local, national, and international laws and regulations.`,
  },
  {
    title: '3. Investment Disclaimer',
    content: `All investments carry risk. Past performance is not indicative of future results. Information provided on this website is for general informational purposes only and does not constitute financial, investment, or legal advice. You should consult a qualified financial advisor before making any investment decisions.`,
  },
  {
    title: '4. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these Terms.`,
  },
  {
    title: '5. Intellectual Property',
    content: `All content on this website, including text, graphics, logos, software, and data, is the property of Let Investments Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written permission.`,
  },
  {
    title: '6. Limitation of Liability',
    content: `To the maximum extent permitted by law, Let Investments shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our services or this website.`,
  },
  {
    title: '7. Privacy',
    content: `Your use of our services is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.`,
  },
  {
    title: '8. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or website notice. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.`,
  },
  {
    title: '10. Contact',
    content: `Questions about these Terms of Service should be sent to legal@letinvestments.com or mailed to: Let Investments Ltd., Upper Hill, Nairobi, Kenya.`,
  },
]

export default function Terms() {
  return (
    <Layout>
      <div className="bg-let-blue py-16">
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl font-heading font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-gray-300">Last updated: May 1, 2026</p>
        </div>
      </div>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl">
          <p className="text-gray-600 text-lg leading-relaxed mb-10">
            Please read these Terms of Service carefully before using the Let Investments website or services. These terms constitute a legal agreement between you and Let Investments Ltd.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
                <h2 className="text-xl font-heading font-bold text-let-blue mb-3">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-4">Need clarification on any of these terms?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary">Contact Us</Link>
              <Link href="/privacy" className="btn-outline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
