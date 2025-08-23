-- Create atomic company creation function
CREATE OR REPLACE FUNCTION public.create_company_and_update_profile(
  company_name text,
  company_code text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_company_id uuid;
  result json;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the company
  INSERT INTO public.companies (name, company_code)
  VALUES (company_name, company_code)
  RETURNING id INTO new_company_id;

  -- Update user's profile to link to company and make them manager
  UPDATE public.profiles 
  SET 
    company_id = new_company_id,
    is_manager = true,
    updated_at = now()
  WHERE user_id = auth.uid();

  -- Return success with company data
  SELECT json_build_object(
    'success', true,
    'company', json_build_object(
      'id', new_company_id,
      'name', company_name,
      'company_code', company_code
    )
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Company code already exists'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;