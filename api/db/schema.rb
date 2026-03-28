# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_28_110748) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "payroll_runs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "export_url"
    t.datetime "generated_at"
    t.float "ot_multiplier", default: 1.5
    t.float "ot_threshold", default: 40.0
    t.date "period_end"
    t.date "period_start"
    t.integer "rounding_rule", default: 0
    t.datetime "updated_at", null: false
  end

  create_table "payroll_summaries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "employee_name"
    t.jsonb "flags", default: []
    t.float "overtime_hours"
    t.uuid "payroll_run_id", null: false
    t.float "regular_hours"
    t.float "total_hours"
    t.datetime "updated_at", null: false
    t.index ["payroll_run_id"], name: "index_payroll_summaries_on_payroll_run_id"
  end

  create_table "punch_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.time "clock_in"
    t.time "clock_out"
    t.float "confidence"
    t.datetime "created_at", null: false
    t.date "date"
    t.string "day_of_week", limit: 3
    t.float "hours_worked"
    t.time "lunch_in"
    t.time "lunch_out"
    t.boolean "manually_edited", default: false
    t.text "notes"
    t.uuid "timecard_id", null: false
    t.datetime "updated_at", null: false
    t.index ["timecard_id"], name: "index_punch_entries_on_timecard_id"
  end

  create_table "timecards", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "employee_name"
    t.string "image_hash"
    t.text "image_url"
    t.integer "ocr_status", default: 0
    t.float "overall_confidence"
    t.date "period_end"
    t.date "period_start"
    t.text "preprocessed_image_url"
    t.jsonb "raw_ocr_response"
    t.datetime "updated_at", null: false
    t.index ["image_hash"], name: "index_timecards_on_image_hash", unique: true
  end

  add_foreign_key "payroll_summaries", "payroll_runs"
  add_foreign_key "punch_entries", "timecards"
end
