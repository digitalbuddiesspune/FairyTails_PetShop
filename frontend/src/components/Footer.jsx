import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    'Shop by Category': [
      { name: 'Dogs', path: '#dogs' },
      { name: 'Cats', path: '#cats' },
      { name: 'Toys', path: '#toys' },
      { name: 'Accessories', path: '#accessories' },
      { name: 'Grooming & Essential', path: '#grooming-essential' },
      { name: 'Health & Supplement', path: '#health-supplement' },
      { name: 'Beds & House', path: '#beds-house' },
    ],
    'Policies': [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Refund & Cancellation Policy', path: '/refund-policy' },
      { name: 'Shipping Policy', path: '/shipping-policy' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' },
    ],
  };

  return (
    <footer className="bg-[#1a1a1a] text-white w-full">
      {/* Main Footer Content */}
      <div className="w-full px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="/" className="inline-block mb-4 bg-white rounded-lg p-2">
              <img 
                src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1770288839/LOGO-2_l5wmxs.png" 
                alt="FairyTails Pet Shop" 
                className="h-14 w-auto object-contain"
              />
            </a>
            <p className="text-gray-400 text-sm mb-4">
              Your one-stop shop for all things pets. Quality products, expert advice, and endless love for your furry friends.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#a3e635] transition-colors">
                <FacebookIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#a3e635] transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#a3e635] transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#a3e635] transition-colors">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.path.startsWith('/') ? (
                      <Link
                        to={link.path}
                        className="text-gray-400 text-sm hover:text-[#a3e635] transition-colors"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.path}
                        className="text-gray-400 text-sm hover:text-[#a3e635] transition-colors"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <a href="mailto:support@fairytails.com" className="flex items-center gap-2 hover:text-[#a3e635] transition-colors">
                <EmailIcon />
                support@fairytails.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-[#a3e635] transition-colors">
                <PhoneIcon />
                +91 98765 43210
              </a>
            </div>
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">We accept:</span>
              <div className="flex gap-2">
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-800">VISA</span>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-800">MC</span>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-800">UPI</span>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-800">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Links Bar */}
      <div className="border-t border-gray-800 w-full">
        <div className="w-full px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <Link to="/privacy-policy" className="hover:text-[#a3e635] transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">·</span>
            <Link to="/refund-policy" className="hover:text-[#a3e635] transition-colors">Refund & Cancellation Policy</Link>
            <span className="text-gray-700">·</span>
            <Link to="/shipping-policy" className="hover:text-[#a3e635] transition-colors">Shipping Policy</Link>
            <span className="text-gray-700">·</span>
            <Link to="/terms-and-conditions" className="hover:text-[#a3e635] transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 w-full">
        <div className="w-full px-4 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2026 FairyTails Pet Shop. All rights reserved. Made with 💚 for pets everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Icon Components
const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export default Footer;
