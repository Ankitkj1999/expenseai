'use client';

import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Settings as SettingsIcon,
  Database,
  Download,
  Upload,
  Moon,
  Sun,
  Bell,
  Globe,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { CURRENCIES, getCurrencyByCode } from '@/lib/constants/currencies';
import { DATE_FORMATS, getDateFormatByValue } from '@/lib/constants/dateFormats';

export default function SettingsPage() {
  // Profile state
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Preferences state
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    transactionUpdates: true,
    insightNotifications: true,
  });

  // Load user data on mount
  useEffect(() => {
    // TODO: Fetch user data from API
    // For now, using mock data
  }, []);

  const handleProfileSave = async () => {
    setIsLoadingProfile(true);
    try {
      // TODO: Implement API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsLoadingPreferences(true);
    try {
      // TODO: Implement API call to update preferences
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    // TODO: Implement export functionality
    toast.info(`Export as ${format.toUpperCase()} feature coming soon`);
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    toast.info('Import feature coming soon');
  };

  const selectedCurrency = getCurrencyByCode(currency);
  const selectedDateFormat = getDateFormatByValue(dateFormat);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and email address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-muted-foreground">
                    This email will be used for notifications and account recovery
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleProfileSave} disabled={isLoadingProfile}>
                    {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password must be at least 8 characters long and include uppercase, lowercase, and numbers
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={() => toast.info('Password change coming soon')}>
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Currency & Format</CardTitle>
                    <CardDescription>
                      Set your preferred currency and date format
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    All amounts will be displayed in {selectedCurrency?.label}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Format
                  </Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Example: {selectedDateFormat?.example}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the app looks and feels
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="theme">Light Mode</Label>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Currently using dark theme. Light mode coming soon.
                    </p>
                  </div>
                  <Switch
                    id="theme"
                    checked={false}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Manage your notification preferences
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="budget-alerts">Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you exceed budget thresholds
                    </p>
                  </div>
                  <Switch
                    id="budget-alerts"
                    checked={notifications.budgetAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, budgetAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="goal-reminders">Goal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about your financial goals
                    </p>
                  </div>
                  <Switch
                    id="goal-reminders"
                    checked={notifications.goalReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, goalReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get weekly spending summaries via email
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="transaction-updates">Transaction Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new transactions
                    </p>
                  </div>
                  <Switch
                    id="transaction-updates"
                    checked={notifications.transactionUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, transactionUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="insight-notifications">AI Insight Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new AI-generated insights
                    </p>
                  </div>
                  <Switch
                    id="insight-notifications"
                    checked={notifications.insightNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, insightNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handlePreferencesSave} disabled={isLoadingPreferences}>
                {isLoadingPreferences ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>
                      Download your financial data in various formats
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export all your transactions, accounts, budgets, and goals to a JSON or CSV file.
                  This can be useful for backup or analysis purposes.
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => handleExport('json')} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </Button>
                  <Button onClick={() => handleExport('csv')} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export as CSV
                  </Button>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Your data will be downloaded securely to your device
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle>Import Data</CardTitle>
                    <CardDescription>
                      Import your financial data from a backup file
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Restore your data from a previously exported JSON file. This will merge with your
                  existing data.
                </p>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleImport} variant="outline" className="gap-2 w-fit">
                    <Upload className="h-4 w-4" />
                    Import from File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JSON
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to backup your current data before importing
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Delete All Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your transactions, accounts, budgets, and goals.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error('Data deletion coming soon')}
                  >
                    Delete All Data
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error('Account deletion coming soon')}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
