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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2"
            >
              Popular Courses
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm text-muted-foreground"
            >
              Learn practical skills from expert creators. Start anytime, learn at your own pace.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link href="/courses">
              <Button size="sm" variant="outline" className="rounded-lg shrink-0">
                View All Courses
              </Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
