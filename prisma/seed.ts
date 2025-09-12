import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建示例用户
  const user1 = await prisma.user.upsert({
    where: { email: 'michael@example.com' },
    update: {},
    create: {
      email: 'michael@example.com',
      name: 'Michael T.',
      image: 'https://picsum.photos/id/91/100/100', // 修复：avatar -> image
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'sophia@example.com' },
    update: {},
    create: {
      email: 'sophia@example.com',
      name: 'Sophia L.',
      image: 'https://picsum.photos/id/65/100/100', // 修复：avatar -> image
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: {
      email: 'david@example.com',
      name: 'David R.',
      image: 'https://picsum.photos/id/22/100/100', // 修复：avatar -> image
    },
  })

  const instructor = await prisma.user.upsert({
    where: { email: 'tanaka@example.com' },
    update: {},
    create: {
      email: 'tanaka@example.com',
      name: 'Sensei Tanaka',
      image: 'https://picsum.photos/id/64/100/100', // 修复：avatar -> image
    },
  })

  // 创建示例课程
  const course = await prisma.course.upsert({
    where: { id: 'tai-chi-master' },
    update: {},
    create: {
      id: 'tai-chi-master',
      title: '太极大师课程',
      category: 'taiji',
      instructor: 'Sensei Tanaka',
      rating: 4.8,
      students: 1247,
    },
  })

  // 创建示例评论
  await prisma.courseReview.createMany({
    data: [
      {
        courseId: course.id,
        userId: user1.id,
        rating: 5,
        content: '作为武术的完全新手，这门课程对我来说是完美的。Sensei Tanaka清楚地解释了一切，并从多个角度演示每种技巧。我特别欣赏对正确形式的强调，以避免受伤。',
        isCompleted: true,
        completedPercentage: 100,
      },
      {
        courseId: course.id,
        userId: user2.id,
        rating: 4,
        content: '优秀的课程！课程进度逻辑清晰，建立信心。我每周练习3-4次，已经能看到进步。WhatsApp访问Sensei Tanaka本身就值得这个价格 - 他对我的站姿给予了很好的反馈。',
        isCompleted: false,
        completedPercentage: 75,
      },
      {
        courseId: course.id,
        userId: user3.id,
        rating: 4,
        content: '这门课程超出了我的期望。Sensei Tanaka的教学方法非常有效，每个动作都有详细的解释。我特别喜欢课程的结构，从基础开始逐步建立。',
        isCompleted: false,
        completedPercentage: 90,
      },
    ],
  })

  // 创建示例讨论
  const discussion1 = await prisma.courseDiscussion.create({
    data: {
      courseId: course.id,
      userId: user3.id,
      content: '在家练习拳法时，没有装备的情况下最好的练习方法是什么？我还没有沙袋。有什么练习可以提高我的拳击力量和技巧？',
      likes: 12,
    },
  })

  const discussion2 = await prisma.courseDiscussion.create({
    data: {
      courseId: course.id,
      userId: user2.id,
      content: '作为初学者，我每天应该练习多长时间？我正在尝试建立一个一致的练习习惯。每天练习多长时间是合理的，而不会感到疲惫？',
      likes: 8,
    },
  })

  // 创建讨论回复
  await prisma.courseDiscussionReply.createMany({
    data: [
      {
        discussionId: discussion1.id,
        userId: instructor.id,
        content: '很好的问题！你可以练习空击，专注于技巧而不是力量。另一个练习是用折叠的毛巾，让你的训练伙伴拿着。这有助于发展控制和正确的形式。',
        likes: 15,
      },
      {
        discussionId: discussion2.id,
        userId: instructor.id,
        content: '对于初学者，每天20-30分钟，每周4-5天是理想的。注重质量而不是数量。一致性比长时间练习更重要。',
        likes: 12,
      },
      {
        discussionId: discussion2.id,
        userId: user1.id,
        content: '我从每天15分钟开始，逐渐增加到30分钟。首先建立习惯让它更容易坚持。',
        likes: 8,
      },
    ],
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
