import Layout from '../components/common/Layout'
import Link from 'next/link'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, including your name, email address, phone number, and financial information when you register for an account or use our services. We also collect usage data, device information, and cookies to improve our services.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to provide, maintain, and improve our services; process transactions; send transactional and promotional communications; monitor and analyze usage patterns; and comply with legal obligations. We will never sell your personal data to third parties.`,
  },
  {
    title: '3. Information Sharing',
    content: `We may share your information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential. We may also share information when required by law or to protect the rights and safety of Let Investments and our users.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures including SSL encryption, Firebase Authentication, and secure data storage to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our service may not function properly without cookies.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to access, correct, or delete your personal information at any time. You may also object to our processing of your data or request data portability. To exercise these rights, please contact us at privacy@letinvestments.com.`,
  },
  {
    title: '7. Changes to This Policy',
    content: `We may update our Privacy Policy from time to time. We will notify you of any significant changes by email or through a prominent notice on our website. Continued use of our services after changes become effective constitutes acceptance of the new policy.`,
  },
  {
    title: '8. Contact Us',
    content: `If you have any questions or concerns about this Privacy Policy, please contact us at privacy@letinvestments.com or write to us at: Let Investments Ltd., Upper Hill, Nairobi, Kenya.`,
  },
]

export default function Privacy() {
  return (
    <Layout>
      <div className="bg-let-blue py-16">
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl font-heading font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: May 1, 2026</p>
        </div>
      </div>

      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl">
          <div className="prose max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Let Investments Ltd. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <div className="space-y-8">
              {sections.map((section, i) => (
                <div key={i} className="border-b border-gray-100 pb-8 last:border-0">
                  <h2 className="text-xl font-heading font-bold text-let-blue mb-3">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-4">Have questions about our privacy practices?</p>
            <Link href="/contact" className="btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
