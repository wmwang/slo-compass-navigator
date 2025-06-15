
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Compass, Route, Settings, CheckCircle, Youtube, ChevronDown } from "lucide-react";

interface AppSidebarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  onYouTubeClick?: () => void;
}

const AppSidebar = ({ currentStep, onStepClick, onYouTubeClick }: AppSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // State for managing which groups are open
  const [openGroups, setOpenGroups] = useState({
    sloSteps: true,
    tools: true
  });

  const toggleGroup = (groupName: 'sloSteps' | 'tools') => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const sloSteps = [
    {
      id: 0,
      title: "識別利害關係人",
      phase: "Identify Stakeholders",
      description: "確定用戶身分",
      icon: Users,
    },
    {
      id: 1,
      title: "定義服務類型",
      phase: "Define Service Type",
      description: "了解服務特性",
      icon: Settings,
    },
    {
      id: 2,
      title: "分析用戶旅程",
      phase: "Analyze User Journey",
      description: "識別關鍵接觸點",
      icon: Route,
    },
    {
      id: 3,
      title: "定義期望結果",
      phase: "Define Desired Outcomes",
      description: "明確業務價值",
      icon: Target,
    },
    {
      id: 4,
      title: "系統依賴檢查",
      phase: "System Dependencies Check",
      description: "評估技術環境",
      icon: Compass,
    },
  ];

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const getStepStyles = (status: string) => {
    if (isCollapsed) {
      switch (status) {
        case "completed":
          return "text-green-700 bg-green-50 hover:bg-green-100";
        case "current":
          return "text-blue-700 bg-blue-50 ring-2 ring-blue-300 hover:bg-blue-100";
        default:
          return "text-slate-500 bg-slate-50 hover:bg-slate-100";
      }
    }
    
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "current":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  return (
    <Sidebar collapsible="icon" className={`border-r-2 border-slate-100 ${isCollapsed ? 'z-50' : ''}`}>
      <SidebarHeader className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-slate-100`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <Target className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-slate-800">SLO Dev Toolkit</h2>
              <p className="text-sm text-slate-600">開發流程導航</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "p-2" : "p-4"}>
        {/* SLO Steps Group */}
        <Collapsible 
          open={openGroups.sloSteps} 
          onOpenChange={() => toggleGroup('sloSteps')}
          className="w-full"
        >
          <SidebarGroup>
            {!isCollapsed && (
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-slate-700 font-semibold mb-3 cursor-pointer hover:text-slate-900 flex items-center justify-between group">
                  SLO 開發週期步驟
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openGroups.sloSteps ? 'rotate-180' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className={isCollapsed ? "space-y-2 px-1" : "space-y-2"}>
                  {sloSteps.map((step) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;
                    
                    return (
                      <SidebarMenuItem key={step.id}>
                        <SidebarMenuButton
                          onClick={() => onStepClick?.(step.id)}
                          tooltip={isCollapsed ? `${step.title} (${step.id + 1}/5)` : undefined}
                          className={`
                            ${isCollapsed ? 'h-12 w-12 p-0 justify-center mx-auto rounded-xl shadow-sm' : 'w-full p-4 border rounded-lg'} 
                            transition-all duration-200 hover:shadow-md
                            ${getStepStyles(status)}
                            ${status === "current" && !isCollapsed ? "ring-2 ring-blue-300" : ""}
                          `}
                        >
                          {isCollapsed ? (
                            <div className="flex-shrink-0">
                              {status === "completed" ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <Icon className="h-6 w-6" />
                              )}
                            </div>
                          ) : (
                            <div className="flex items-start gap-3 w-full">
                              <div className="flex-shrink-0 mt-1">
                                {status === "completed" ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Icon className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{step.title}</span>
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs px-2 py-0.5 ${
                                      status === "current" ? "bg-blue-200 text-blue-800" :
                                      status === "completed" ? "bg-green-200 text-green-800" :
                                      "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    {step.id + 1}/5
                                  </Badge>
                                </div>
                                <p className="text-xs opacity-80 mb-1">{step.phase}</p>
                                <p className="text-xs opacity-70">{step.description}</p>
                              </div>
                            </div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Tools and Resources Group */}
        <Collapsible 
          open={openGroups.tools} 
          onOpenChange={() => toggleGroup('tools')}
          className="w-full mt-6"
        >
          <SidebarGroup>
            {!isCollapsed && (
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-slate-700 font-semibold mb-3 cursor-pointer hover:text-slate-900 flex items-center justify-between group">
                  工具與資源
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openGroups.tools ? 'rotate-180' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className={isCollapsed ? "space-y-2 px-1" : "space-y-2"}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={onYouTubeClick}
                      tooltip={isCollapsed ? "YouTube 資源" : undefined}
                      className={`
                        ${isCollapsed ? 'h-12 w-12 p-0 justify-center mx-auto rounded-xl shadow-sm' : 'w-full p-4 border border-slate-200 rounded-lg'} 
                        transition-all duration-200 hover:shadow-md hover:bg-red-50 hover:border-red-200
                      `}
                    >
                      {isCollapsed ? (
                        <Youtube className="h-6 w-6 text-red-600" />
                      ) : (
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-shrink-0">
                            <Youtube className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium text-sm text-slate-800">YouTube 資源</span>
                            <p className="text-xs text-slate-600 mt-1">SLO 相關教學影片</p>
                          </div>
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                
                {!isCollapsed && (
                  <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center mt-4">
                    <p className="text-sm text-slate-500">未來功能擴充區域</p>
                  </div>
                )}
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className={`${isCollapsed ? 'p-3' : 'p-4'} border-t border-slate-100`}>
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-slate-500">基於 Google SLO 白皮書</p>
            <p className="text-xs text-slate-400 mt-1">v1.0.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
