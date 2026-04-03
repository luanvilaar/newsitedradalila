import type { Meta, StoryObj } from "@storybook/react";
import {
  BodySegmentIllustration,
  type SegmentTrendData,
} from "./BodySegmentIllustration";

const meta = {
  title: "Components/Bioimpedance/BodySegmentIllustration",
  component: BodySegmentIllustration,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    gender: {
      control: "radio",
      options: ["neutral", "feminine", "masculine"],
      description: "Avatar gender representation",
    },
    mode: {
      control: "radio",
      options: ["leanMass", "fat", "water"],
      description: "Analysis mode",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Avatar size",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading skeleton",
    },
    className: {
      control: "text",
      description: "Custom CSS classes",
    },
    segments: {
      control: false,
      description: "Segment trend data",
    },
    onSegmentClick: {
      action: "segmentClicked",
      description: "Callback when segment is clicked",
    },
  },
} satisfies Meta<typeof BodySegmentIllustration>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data - healthy progress
const healthyProgressSegments: SegmentTrendData[] = [
  {
    segment: "armLeft",
    currentValue: 2.3,
    previousValue: 2.1,
    percentChange: 9.5,
    type: "muscle",
    hasSignificantChange: true,
  },
  {
    segment: "armRight",
    currentValue: 2.25,
    previousValue: 2.1,
    percentChange: 7.1,
    type: "muscle",
    hasSignificantChange: true,
  },
  {
    segment: "legLeft",
    currentValue: 7.0,
    previousValue: 7.2,
    percentChange: -2.8,
    type: "fat",
    hasSignificantChange: false,
  },
  {
    segment: "legRight",
    currentValue: 6.95,
    previousValue: 7.15,
    percentChange: -2.8,
    type: "fat",
    hasSignificantChange: false,
  },
  {
    segment: "torso",
    currentValue: 19.5,
    previousValue: 19.2,
    percentChange: 1.6,
    type: "stable",
    hasSignificantChange: false,
  },
];

// Mock data - with concerns
const concernSegments: SegmentTrendData[] = [
  {
    segment: "armLeft",
    currentValue: 1.9,
    previousValue: 2.1,
    percentChange: -9.5,
    type: "concern",
    hasSignificantChange: true,
  },
  {
    segment: "armRight",
    currentValue: 2.1,
    previousValue: 2.1,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
  {
    segment: "legLeft",
    currentValue: 7.5,
    previousValue: 7.2,
    percentChange: 4.2,
    type: "concern",
    hasSignificantChange: true,
  },
  {
    segment: "legRight",
    currentValue: 7.4,
    previousValue: 7.15,
    percentChange: 3.5,
    type: "concern",
    hasSignificantChange: true,
  },
  {
    segment: "torso",
    currentValue: 20.1,
    previousValue: 19.2,
    percentChange: 4.7,
    type: "concern",
    hasSignificantChange: true,
  },
];

// Mock data - excellent progress
const excellentProgressSegments: SegmentTrendData[] = [
  {
    segment: "armLeft",
    currentValue: 2.5,
    previousValue: 2.1,
    percentChange: 19.0,
    type: "muscle",
    hasSignificantChange: true,
  },
  {
    segment: "armRight",
    currentValue: 2.48,
    previousValue: 2.1,
    percentChange: 18.1,
    type: "muscle",
    hasSignificantChange: true,
  },
  {
    segment: "legLeft",
    currentValue: 6.8,
    previousValue: 7.2,
    percentChange: -5.6,
    type: "fat",
    hasSignificantChange: true,
  },
  {
    segment: "legRight",
    currentValue: 6.75,
    previousValue: 7.15,
    percentChange: -5.6,
    type: "fat",
    hasSignificantChange: true,
  },
  {
    segment: "torso",
    currentValue: 18.5,
    previousValue: 19.2,
    percentChange: -3.6,
    type: "fat",
    hasSignificantChange: true,
  },
];

// Mock data - stable/no change
const stableSegments: SegmentTrendData[] = [
  {
    segment: "armLeft",
    currentValue: 2.1,
    previousValue: 2.1,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
  {
    segment: "armRight",
    currentValue: 2.1,
    previousValue: 2.1,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
  {
    segment: "legLeft",
    currentValue: 7.2,
    previousValue: 7.2,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
  {
    segment: "legRight",
    currentValue: 7.15,
    previousValue: 7.15,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
  {
    segment: "torso",
    currentValue: 19.2,
    previousValue: 19.2,
    percentChange: 0,
    type: "stable",
    hasSignificantChange: false,
  },
];

export const Default: Story = {
  args: {
    segments: healthyProgressSegments,
    gender: "neutral",
    mode: "leanMass",
    size: "md",
    isLoading: false,
  },
};

export const FeminineFigure: Story = {
  args: {
    ...Default.args,
    gender: "feminine",
  },
  parameters: {
    docs: {
      description: {
        story: "Avatar with feminine body proportions (wider hips, narrower shoulders)",
      },
    },
  },
};

export const MasculineFigure: Story = {
  args: {
    ...Default.args,
    gender: "masculine",
  },
  parameters: {
    docs: {
      description: {
        story: "Avatar with masculine body proportions (broader shoulders, narrower hips)",
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    ...Default.args,
    size: "sm",
  },
  parameters: {
    docs: {
      description: {
        story: "Small avatar suitable for cards and compact layouts",
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    ...Default.args,
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Large avatar for detailed analysis displays",
      },
    },
  },
};

export const FatAnalysisMode: Story = {
  args: {
    ...Default.args,
    mode: "fat",
  },
  parameters: {
    docs: {
      description: {
        story: "Avatar in fat composition analysis mode",
      },
    },
  },
};

export const WaterAnalysisMode: Story = {
  args: {
    ...Default.args,
    mode: "water",
  },
  parameters: {
    docs: {
      description: {
        story: "Avatar in water balance analysis mode",
      },
    },
  },
};

export const HealthyProgress: Story = {
  args: {
    ...Default.args,
    segments: healthyProgressSegments,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows healthy progress with muscle gains (green) and fat loss (amber). Pulse animations on significant changes.",
      },
    },
  },
};

export const ConcernedAreas: Story = {
  args: {
    ...Default.args,
    segments: concernSegments,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Highlights areas of concern with red coloring and pulse animations. Indicates segments that need attention.",
      },
    },
  },
};

export const ExcellentProgress: Story = {
  args: {
    ...Default.args,
    segments: excellentProgressSegments,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows excellent progress across all segments with significant improvements in muscle and fat metrics.",
      },
    },
  },
};

export const StableMetrics: Story = {
  args: {
    ...Default.args,
    segments: stableSegments,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All segments are stable with no significant changes. No pulse animations. Gray coloring indicates maintenance.",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows loading skeleton while data is being fetched",
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    ...Default.args,
    segments: healthyProgressSegments,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click on any segment to expand details. Use keyboard (Tab + Enter) for accessibility.",
      },
    },
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <BodySegmentIllustration
        {...args}
        onSegmentClick={(segment) => {
          console.log("Clicked segment:", segment);
        }}
      />
    </div>
  ),
};

export const AllGenderVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows all three gender variants side by side with the same data for comparison",
      },
    },
  },
  render: () => (
    <div className="flex gap-12 justify-center items-start">
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Neutral</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          gender="neutral"
          size="md"
        />
      </div>
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Feminine</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          gender="feminine"
          size="md"
        />
      </div>
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Masculine</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          gender="masculine"
          size="md"
        />
      </div>
    </div>
  ),
};

export const AllSizeVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Shows all three size variants (sm, md, lg) with the same data",
      },
    },
  },
  render: () => (
    <div className="flex gap-8 justify-center items-end">
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Small</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          size="sm"
        />
      </div>
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Medium</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          size="md"
        />
      </div>
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Large</h3>
        <BodySegmentIllustration
          segments={healthyProgressSegments}
          size="lg"
        />
      </div>
    </div>
  ),
};

export const ColorPalette: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the semantic color palette: Green (muscle), Amber (fat), Blue (water), Red (concern), Gray (stable)",
      },
    },
  },
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-lg bg-emerald-500"></div>
        <span className="text-sm font-medium">Muscle Gain (#10B981)</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-lg bg-amber-500"></div>
        <span className="text-sm font-medium">Fat Loss (#F59E0B)</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-lg bg-blue-500"></div>
        <span className="text-sm font-medium">Hydration (#3B82F6)</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-lg bg-red-500"></div>
        <span className="text-sm font-medium">Concern (#EF4444)</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-lg bg-gray-500"></div>
        <span className="text-sm font-medium">Stable (#9CA3AF)</span>
      </div>
    </div>
  ),
};
