import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

interface SliderProps {
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number[]) => void;
}

export const Slider: React.FC<SliderProps> = ({...props}) => {
  const thumbs = props.defaultValue || [1];
  return (
    <SliderPrimitive.Slider
      className="relative flex items-center user-select-none touch-action-none w-full h-20"
      defaultValue={thumbs}
      orientation="horizontal"
      step={props.step || 10}
      min={props.min || 100}
      max={props.max || 100000000}
      minStepsBetweenThumbs={100}
      onValueChange={(value) => {
        if (props.onChange) {
          props.onChange([...value]);
        }
      }}
    >
      <SliderPrimitive.Track className="bg-muted relative flex-grow rounded-full h-1">
        <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.SliderThumb key={i} className="block w-5 h-5 bg-white shadow border focus:outline-none focus:shadow-lg hover:bg-gray-50 rounded-full" />
      ))}
    </SliderPrimitive.Slider>
)};
