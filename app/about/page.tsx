"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Users, Target, Shield, Heart, ArrowRight, Zap } from "lucide-react";

export default function AboutPage() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  const values = [
    {
      icon: <Zap className="w-6 h-6 text-violet-500" />,
      title: "Seamless Efficiency",
      description: "We design every feature to eliminate scheduling friction. Time is humanity's most scarce resource, and we want to help you preserve it."
    },
    {
      icon: <Target className="w-6 h-6 text-cyan-500" />,
      title: "Scheduling-First Vision",
      description: "We believe calendars shouldn't just be grids. They should act as active assistants that automate scheduling, logistics, and prep."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Trust & Privacy First",
      description: "Your schedule is your life. We safeguard your calendar permissions and metadata with industry-standard encryption and strict privacy protocols."
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: "Designed to Delight",
      description: "Software should feel alive and beautiful. We pour craftsmanship into every pixel, micro-interaction, and responsive design."
    }
  ];

  const team = [
    {
      name: "Zakiya Tahasildar",
      role: "Founder & Lead Architect",
      initials: "ZT",
      color: "from-violet-500 to-indigo-600"
    },
    {
      name: "Shivam Kishore",
      role: "Lead Fullstack Engineer",
      initials: "SK",
      color: "from-cyan-400 to-blue-500"
    },
    {
      name: "Umme Haany K",
      role: "Senior UX Designer & Product Manager",
      initials: "UH",
      color: "from-emerald-400 to-teal-500"
    }
  ];

  return (
    <div className="public-page bg-[#fbfbfe] text-[#1a1a2e] dark:bg-[#0b1020] dark:text-white overflow-x-hidden min-h-screen transition-colors duration-300">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#6c63ff]/10 dark:bg-[#6c63ff]/5 blur-3xl"></div>
        <div className="absolute top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#00d4ff]/10 dark:bg-[#00d4ff]/5 blur-3xl"></div>
      </div>

      {/* HEADER */}
      <PublicHeader />

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="reveal inline-flex items-center gap-2 text-[13px] font-semibold text-[#6c63ff] dark:text-[#9aa0ff] bg-[#6c63ff]/10 dark:bg-[#6c63ff]/20 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] dark:bg-[#9aa0ff]"></span> Our Story
        </span>
        <h1 className="reveal text-[40px] sm:text-[54px] leading-[1.08] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white">
          We're building the future of<br />
          <span className="bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] bg-clip-text text-transparent">modern scheduling.</span>
        </h1>
        <p className="reveal mt-6 text-[17px] leading-relaxed text-[#1a1a2e]/60 dark:text-white/60 max-w-2xl mx-auto">
          At EdOra, we believe that scheduling shouldn't require complex back-and-forth emails. We're creating a beautifully crafted system that organizes your calendar on autopilot.
        </p>
      </section>

      {/* MISSION & VISION */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal space-y-6">
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-[#1a1a2e] dark:text-white">
              Our Mission
            </h2>
            <p className="text-[16px] leading-relaxed text-[#1a1a2e]/60 dark:text-white/60">
              EdOra was born out of a simple frustration: calendar coordination is a waste of human creativity. Every hour spent emailing back and forth to find "a good time" is an hour taken away from actual work, building, and connecting.
            </p>
            <p className="text-[16px] leading-relaxed text-[#1a1a2e]/60 dark:text-white/60">
              We set out to build a platform that fits seamlessly into your workflow. By combining high-speed scheduling interfaces, custom booking paths, and deep integrations, we allow you to focus on the conversation, not the scheduling.
            </p>
            <div className="pt-2">
              <Link
                href="/login?mode=signup"
                className="group inline-flex items-center gap-2 text-[#6c63ff] dark:text-[#9aa0ff] font-bold text-sm hover:underline"
              >
                Join our journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
          <div className="reveal relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-8 bg-[#0d1326] text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#6c63ff]/20 to-transparent blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#00d4ff]/10 to-transparent blur-2xl"></div>
            <div className="relative space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-xl font-bold">🎯</div>
              <h3 className="text-xl font-bold">Why EdOra?</h3>
              <ul className="space-y-3.5 text-white/70 text-sm">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#6c63ff] font-bold">✓</span> Integrated email invites sent securely using customizable SMTP servers.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#6c63ff] font-bold">✓</span> Direct API sync with Google Meet, Calendar, and Zoom accounts.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#6c63ff] font-bold">✓</span> Intelligent host timezone normalization and availability matching.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#6c63ff] font-bold">✓</span> Exquisite design aesthetic matching the needs of modern developers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto reveal mb-14">
          <span className="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff] dark:text-[#9aa0ff]">How we build</span>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight mt-3 text-[#1a1a2e] dark:text-white">
            The principles that guide us
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <div 
              key={i} 
              className="reveal p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-[#6c63ff]/30 dark:hover:border-[#00d4ff]/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {v.icon}
              </div>
              <h3 className="text-lg font-bold mt-4 text-[#1a1a2e] dark:text-white">{v.title}</h3>
              <p className="text-sm text-[#1a1a2e]/60 dark:text-white/60 mt-2 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-12 pb-24">
        <div className="text-center max-w-2xl mx-auto reveal mb-16">
          <span className="text-[13px] font-bold uppercase tracking-widest text-[#6c63ff] dark:text-[#9aa0ff]">Our Team</span>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight mt-3 text-[#1a1a2e] dark:text-white">
            Meet the innovators
          </h2>
          <p className="text-[#1a1a2e]/55 dark:text-white/55 mt-4 text-[16px]">
            We are a distributed team of engineers, designers, and organizers dedicated to building beautiful web utilities.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <div 
              key={i} 
              className="reveal rounded-2xl bg-white dark:bg-[#0d1326] border border-black/5 dark:border-white/5 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center p-6 text-center"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-extrabold shadow-lg`}>
                {member.initials}
              </div>
              <h3 className="text-lg font-bold text-[#1a1a2e] dark:text-white mt-5">{member.name}</h3>
              <p className="text-xs text-[#6c63ff] dark:text-[#9aa0ff] font-semibold mt-1 uppercase tracking-wider">{member.role}</p>
              <p className="text-xs text-[#1a1a2e]/45 dark:text-white/45 mt-3 leading-relaxed">
                Dedicated to craftsmanship, performance, and responsive interfaces.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
