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
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-foreground"
            >
              EXPLORE <span className="text-primary">MASTERCLASSES</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-muted-foreground text-lg md:text-xl font-medium"
            >
              Learn from the world's best creators with our production-grade, cinematic courses.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/courses">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-primary/20 hover:bg-primary/5 text-foreground transition-all">
                View Catalog
              </Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="h-full"
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
