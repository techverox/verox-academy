"use client";

import { motion } from "framer-motion";
import { Course } from "@/types/firestore";
import CourseCard from "@/components/CourseCard";

interface MotionGridProps {
  courses: Course[];
}

export function MotionGrid({ courses }: MotionGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {courses.map((course, i) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <CourseCard course={course} />
        </motion.div>
      ))}
    </div>
  );
}
