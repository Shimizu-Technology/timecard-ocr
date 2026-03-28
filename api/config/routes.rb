Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :timecards, only: [:index, :create, :show]
      resources :punch_entries, only: [:update]
      resources :payroll_runs, only: [:index, :create, :show] do
        member { get :export }
      end
    end
  end
  get '/health', to: proc { [200, {}, ['ok']] }
end
