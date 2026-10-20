import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://kuarapavwvqpfxmbbkvl.supabase.co/rest/v1/hotel_data";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YXJhcGF2d3ZxcGZ4bWJia3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTI0NjUsImV4cCI6MjEwODA2ODQ2NX0.7BLtGoke9ukB6Kd2g-Yym1Q5V9uzak1QmY1eTa2qTuE";


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase.realtime.accessToken = SUPABASE_ANON_KEY;