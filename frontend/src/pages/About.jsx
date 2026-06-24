import { type } from '../styles/typography';

const About = () => {
  const team = [
    { name: 'Dr. Priya Sharma', role: 'Founder & Chief Vet', emoji: '👩‍⚕️' },
    { name: 'Rahul Patel', role: 'Operations Head', emoji: '👨‍💼' },
    { name: 'Sneha Gupta', role: 'Pet Care Expert', emoji: '👩‍🔬' },
    { name: 'Amit Kumar', role: 'Customer Support', emoji: '👨‍💻' },
  ];

  const stats = [
    { number: '10K+', label: 'Happy Pets' },
    { number: '5K+', label: 'Products' },
    { number: '50+', label: 'Expert Vets' },
    { number: '100+', label: 'Cities Served' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#205EA9] to-[#205EA9] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className={`${type.hero} text-white mb-4`}>About FairyTails</h1>
          <p className={`text-white/90 ${type.body} max-w-2xl mx-auto`}>
            Your trusted partner in pet care since 2020. We believe every pet deserves the best!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`${type.h1} text-[#205ea9]`}>{stat.number}</div>
              <div className={`text-gray-600 ${type.bodySm}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className={`${type.h2} text-gray-900 mb-4`}>Our Story</h2>
            <div className={`space-y-4 text-gray-600 ${type.body}`}>
              <p>
                FairyTails was born from a simple idea – pets are family, and they deserve the very best care. 
                Founded in 2020 by Dr. Priya Sharma, a passionate veterinarian, we started as a small pet clinic 
                in Mumbai.
              </p>
              <p>
                Today, we've grown into India's most loved pet care platform, offering everything from premium 
                pet food and accessories to expert veterinary consultations. Our journey has been guided by 
                one principle: putting the health and happiness of pets first.
              </p>
              <p>
                We work directly with trusted brands and certified suppliers to ensure every product we sell 
                meets our high standards. Our team of pet experts is always available to help you make the 
                best choices for your furry friends.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <img 
                src="https://res.cloudinary.com/dfhjtmvrz/image/upload/v1772708031/download_4.jfif_bkwd2g.jpg" 
                alt="Where Pets Come First" 
                className="w-56 h-56 md:w-72 md:h-72 rounded-2xl object-cover mb-4 mx-auto"
              />
              <p className={`text-[#205ea9] ${type.h4} mt-4`}>Where Pets Come First</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className={`${type.h2} text-gray-900 text-center mb-8`}>Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '❤️', title: 'Love for Pets', desc: 'Every decision we make is guided by what\'s best for pets.' },
              { icon: '✅', title: 'Quality First', desc: 'We source only premium, vet-approved products.' },
              { icon: '🤝', title: 'Trust & Care', desc: 'Building lasting relationships with pet parents.' },
            ].map((value, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200">
                <div className="w-16 h-16 bg-[#dbeafe] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{value.icon}</span>
                </div>
                <h3 className={`${type.h4} text-gray-900 mb-2`}>{value.title}</h3>
                <p className={`text-gray-600 ${type.small}`}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <h2 className={`${type.h2} text-gray-900 text-center mb-8`}>Meet Our Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#205ea9]/20 to-[#205ea9]/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl md:text-4xl">{member.emoji}</span>
              </div>
              <h3 className={`${type.cardTitle} text-gray-900`}>{member.name}</h3>
              <p className={`text-gray-500 ${type.small}`}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className={`${type.h2} text-white mb-4`}>Ready to give your pet the best?</h2>
          <p className={`text-gray-400 mb-6 max-w-xl mx-auto ${type.body}`}>
            Join thousands of happy pet parents who trust FairyTails for all their pet needs.
          </p>
          <a 
            href="/" 
            className={`inline-block bg-[#205EA9] hover:bg-[#205EA9] text-white px-8 py-3 rounded-xl transition-colors ${type.button}`}
          >
            Start Shopping 🛒
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
