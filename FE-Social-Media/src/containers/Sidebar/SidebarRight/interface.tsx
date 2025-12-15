export interface TextColor {
  color: string;
}

export interface BackgroundColor {
  background: string;
}

export interface SiderRightProps {
  isDarkMode: boolean;
}

export interface UpcomingBirthdaysProps {
  isDarkMode: boolean;
  isBirthday?: boolean;
  setIsBirthday: (value: boolean) => void;
}
export interface UpcomingEventsProps {
  isDarkMode: boolean;
  isEvent?: boolean;
  setIsEvent: (value: boolean) => void;
}
