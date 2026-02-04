import { createClient } from "@supabase/supabase-js";


// NEXT_PUBLIC_SUPABASE_URL=https://qklwlyoenlffxnwrkxuc.supabase.co
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_vRs3fNijxnMlzSHMi0G51w_-nBefUoq

const SUPABASE_URL='https://yvztwadvzlapiqjkmabb.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2enR3YWR2emxhcGlxamttYWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTg5NTgsImV4cCI6MjA3MTYzNDk1OH0.Qpdbx60TXvplTVEB1nDkRh7-KqEarFVIsGAFXC8xxxc';


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const main = async () => {
    console.log("Hello World");

    await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'Test123.'
    })

    const uuid = '01dd8c5e-728c-458e-b17f-6c7b4cc06d7d';
    // const { data, error } = await supabase.functions.invoke(`/form_case_two/get/${uuid}`, {
    //     method: 'GET',
    // })

    const { data, error } = await supabase.from("form_case_two").select(`
        "id","name","description","aditional_financing","constraint_custom","estimated_budget_currency","aditional_financing_amount","aditional_financing_currency","estimated_budget_amount","estimated_budget_explain",
        description:form_case_two_extended_docs!form_case_two_description_fkey("id","name","path"),
        estimated_budget_explain:form_case_two_extended_docs!form_case_two_estimated_budget_explain_fkey("id","name","path"),
        aditional_financing:form_case_two_extended_docs!form_case_two_aditional_financing_fkey("id","name","path"),
        constraint_custom:form_case_two_extended_docs!form_case_two_constraint_custom_fkey("id","name","path"),
        form_case_two_policy_objective_relation("form_case_two_policy_sub_objective_id",form_case_two_policy_sub_objective("id","name",group:form_cae_two_policy_objective_id("name"))),
        form_case_two_target_population_relation("form_case_two_target_population_id",form_case_two_target_population_groups_values("id","name",group:form_case_two_target_population_groups("name"))),
        locations:form_case_two_locations("id","address","lat","lon"),
        form_case_two_actors_relations("form_case_two_actors_groups_values_id",form_case_two_actors_groups_values("id","name",group:actor_group_id("name"))),
        form_case_two_constraints_relation("form_case_two_constraints_id",form_case_two_constraints("id","name"))
      `).eq("id", uuid).single();
    console.log(data);
    console.log(error);


    

}

main();