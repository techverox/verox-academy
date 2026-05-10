"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import CourseSkeleton from "@/components/CourseSkeleton";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        // Just take the first 3 for the landing page
        setCourses(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load featured courses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <section className="py-32 bg-zinc-950/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tighter">
              EXPLORE <span className="text-primary">MASTERCLASSES</span>
            </h2>
            <p className="text-zinc-400 text-lg">
              Learn from the world's best creators with our production-grade courses.
            </p>
          </div>
          <Link href="/courses">
            <Button variant="outline" className="rounded-full glass">View All Courses</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
